import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PaymentTransaction from "@/models/PaymentTransaction";
import { grantProSubscription, getPlanDetails, BillingCycle } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const txRef = typeof body.txRef === "string" ? body.txRef.trim() : "";
    const transactionId =
      typeof body.transactionId === "string" || typeof body.transactionId === "number"
        ? String(body.transactionId).trim()
        : "";

    if (!txRef && !transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction reference or ID is required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Missing FLW_SECRET_KEY in environment." },
        { status: 500 }
      );
    }

    await connectDB();

    // Find our database record
    let query: Record<string, unknown> = { userId };
    if (txRef) query.txRef = txRef;
    else if (transactionId) query.flwTransactionId = transactionId;

    const transaction = await PaymentTransaction.findOne(query);

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    // If already verified, return early
    if (transaction.status === "successful") {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Subscription is already active.",
      });
    }

    // Call Flutterwave Verify API
    let verifyUrl = "";
    if (transactionId) {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
    } else {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        txRef
      )}`;
    }

    const flwVerifyRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await flwVerifyRes.json().catch(() => ({}));

    if (
      !flwVerifyRes.ok ||
      verifyData.status !== "success" ||
      !verifyData.data ||
      verifyData.data.status !== "successful"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            verifyData.message ||
            "Payment verification failed or transaction is not successful.",
        },
        { status: 400 }
      );
    }

    const flwData = verifyData.data;

    // Security validation 1: Enforce transaction ownership
    if (transaction.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized transaction verification attempt." },
        { status: 403 }
      );
    }

    // Security validation 2: Enforce matching transaction references
    if (flwData.tx_ref !== transaction.txRef) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction reference mismatch between provider and record.",
        },
        { status: 400 }
      );
    }

    // Security validation 3: Check metadata user ID if present
    if (flwData.meta?.userId && flwData.meta.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { success: false, message: "Transaction metadata does not match authenticated user." },
        { status: 403 }
      );
    }

    // Determine expected plan details based on record or amount
    const planCycle: BillingCycle =
      transaction.planCycle === "annual" || flwData.amount >= 15000
        ? "annual"
        : "monthly";
    const plan = getPlanDetails(planCycle);

    // Validate payment amount & currency (reject underpayments and incorrect currencies)
    if (flwData.amount < plan.priceNgn || flwData.currency !== "NGN") {
      transaction.status = "failed";
      transaction.flwData = flwData;
      await transaction.save();

      return NextResponse.json(
        {
          success: false,
          message: `Invalid amount or currency detected (received ${flwData.currency} ${flwData.amount}, expected ${plan.priceNgn} NGN for ${plan.title}).`,
        },
        { status: 400 }
      );
    }

    // Atomically transition status from pending to successful.
    // If another thread (e.g. parallel webhook) already claimed it, updatedTx will be null.
    const updatedTx = await PaymentTransaction.findOneAndUpdate(
      {
        _id: transaction._id,
        status: { $ne: "successful" },
      },
      {
        $set: {
          status: "successful",
          planCycle: plan.cycle,
          flwTransactionId: String(flwData.id),
          paymentType: flwData.payment_type || undefined,
          paidAt: new Date(flwData.created_at || Date.now()),
          flwData: flwData,
        },
      },
      { new: false }
    );

    if (!updatedTx) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Subscription is already active.",
      });
    }

    // Grant Pro days to user (guaranteed to execute at most once per transaction)
    await grantProSubscription(transaction.userId.toString(), plan.durationDays);

    return NextResponse.json({
      success: true,
      message: `Payment verified successfully! Welcome to ${plan.title}.`,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 }
    );
  }
}

