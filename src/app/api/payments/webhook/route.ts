import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import PaymentTransaction from "@/models/PaymentTransaction";
import { grantProSubscription, PRO_PRICE_NGN } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const signature =
      request.headers.get("verif-hash") ||
      request.headers.get("x-verif-hash");
    const secretHash = process.env.FLW_WEBHOOK_HASH;

    // Fail closed: Webhooks must be strictly authenticated
    if (!secretHash || !signature) {
      console.warn("Webhook rejected: missing signature or unconfigured FLW_WEBHOOK_HASH.");
      return NextResponse.json(
        { message: "Unauthorized webhook request" },
        { status: 401 }
      );
    }

    const signatureBuffer = Buffer.from(signature);
    const secretBuffer = Buffer.from(secretHash);

    // Constant-time signature comparison to prevent timing attacks
    if (
      signatureBuffer.length !== secretBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, secretBuffer)
    ) {
      console.warn("Unauthorized webhook attempt with mismatched signature.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || !payload.data) {
      return NextResponse.json({ message: "Empty payload" }, { status: 400 });
    }

    const { event, data } = payload;

    // Flutterwave emits charge.completed event on payment success
    if (event !== "charge.completed" || data?.status !== "successful") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing FLW_SECRET_KEY for webhook verification.");
      return NextResponse.json(
        { message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const transactionId = data.id;
    const txRef = data.tx_ref;

    if (!transactionId && !txRef) {
      return NextResponse.json({ message: "Missing transaction identifiers" }, { status: 400 });
    }

    // Server-to-server transaction verification with Flutterwave API
    const verifyUrl = transactionId
      ? `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
          txRef
        )}`;

    const flwRes = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await flwRes.json().catch(() => ({}));
    if (
      !flwRes.ok ||
      verifyData.status !== "success" ||
      !verifyData.data ||
      verifyData.data.status !== "successful"
    ) {
      console.error("Webhook server verification failed:", verifyData);
      return NextResponse.json({ message: "Verification failed" }, { status: 400 });
    }

    const verified = verifyData.data;

    // Verify amount and currency
    if (verified.amount < PRO_PRICE_NGN || verified.currency !== "NGN") {
      console.warn(
        `Webhook amount mismatch: expected at least ${PRO_PRICE_NGN} NGN, received ${verified.amount} ${verified.currency}`
      );
      return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
    }

    await connectDB();

    // Find the matching transaction
    const transaction = await PaymentTransaction.findOne({
      $or: [{ txRef: verified.tx_ref }, { flwTransactionId: String(verified.id) }],
    });

    if (transaction) {
      // Atomic compare-and-swap status transition prevents duplicate activation
      const updatedTx = await PaymentTransaction.findOneAndUpdate(
        {
          _id: transaction._id,
          status: { $ne: "successful" },
        },
        {
          $set: {
            status: "successful",
            flwTransactionId: String(verified.id),
            paymentType: verified.payment_type || undefined,
            paidAt: new Date(verified.created_at || Date.now()),
            flwData: verified,
          },
        },
        { new: false }
      );

      if (!updatedTx) {
        return NextResponse.json({ status: "already_processed" }, { status: 200 });
      }

      await grantProSubscription(transaction.userId.toString(), 30);
    } else {
      console.warn("Transaction reference not found in database:", verified.tx_ref);
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { message: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}

