import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PaymentTransaction from "@/models/PaymentTransaction";
import { PRO_PRICE_NGN } from "@/lib/subscription";
import { SITE_CONFIG } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const userName = session?.user?.name || "Wardrobe AI Member";

    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, message: "Please sign in to upgrade to Pro." },
        { status: 401 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Flutterwave secret key is not configured. Please add FLW_SECRET_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Determine the base origin for redirect (defend against Host Header Injection)
    let origin =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      SITE_CONFIG.url;
    const reqHost = request.headers.get("host") || "";
    if (reqHost.includes("localhost")) {
      origin = `http://${reqHost}`;
    }

    // Throttle rapid checkout generation spam (10s cooldown per user)
    const recentPending = await PaymentTransaction.findOne({
      userId,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 10 * 1000) },
    });

    if (recentPending) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A checkout session was recently created. Please wait a few seconds before trying again.",
        },
        { status: 429 }
      );
    }

    // Create unique, cryptographically unguessable transaction reference
    const timestamp = Date.now();
    const cleanUserId = userId.toString().slice(-6);
    const nonce = crypto.randomBytes(4).toString("hex");
    const txRef = `wb_${cleanUserId}_${timestamp}_${nonce}`;

    // Save pending transaction in database
    await PaymentTransaction.create({
      userId,
      txRef,
      amount: PRO_PRICE_NGN,
      currency: "NGN",
      status: "pending",
      customerEmail: userEmail,
      customerName: userName,
    });

    // Call Flutterwave hosted checkout API
    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: PRO_PRICE_NGN,
        currency: "NGN",
        redirect_url: `${origin}/wardrobe?payment_verify=1&tx_ref=${txRef}`,
        customer: {
          email: userEmail,
          name: userName,
        },
        customizations: {
          title: "Wardrobe Pro (₦1,500)",
          description: "30-Day Pass: Unlimited clothes & daily AI styling",
          logo: `${origin}/icon1.png`,
        },
        meta: {
          userId,
          product: "wardrobe_pro_30_days",
        },
      }),
    });

    const responseData = await flwResponse.json().catch(() => ({}));

    if (!flwResponse.ok || responseData.status !== "success" || !responseData.data?.link) {
      console.error("Flutterwave API initialization error:", responseData);
      return NextResponse.json(
        {
          success: false,
          message:
            responseData.message || "Failed to initialize Flutterwave checkout.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: responseData.data.link,
      txRef,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error while initializing payment." },
      { status: 500 }
    );
  }
}
