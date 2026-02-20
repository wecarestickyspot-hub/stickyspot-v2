import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import Razorpay from "razorpay"; // 🚀 Added for Amount Verification

// 🛡️ 1. Input Validation Schema
const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Check if data is correct
    const validatedData = verifySchema.parse(body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validatedData;

    // 🛡️ 2. Razorpay Signature Verification (Hacker Protection)
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed! Fake payment detected. 🚫" }, { status: 400 });
    }

    // 🔍 3. Find the order in our database
    const existingOrder = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true } 
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found in database!" }, { status: 404 });
    }

    // 🛡️ FIX 2: Idempotency & Strict Status Check
    // Agar order pehle hi verify ho chuka hai (by webhook or double click), toh safely success bhej do
    if (existingOrder.status === "PROCESSING" || existingOrder.status === "PAID" || existingOrder.status === "SHIPPED") {
      return NextResponse.json({ success: true, message: "Order already verified" });
    }

    // Agar PENDING ke alawa koi aur status hai (jaise CANCELLED ya UNVERIFIED), toh block karo
    if (existingOrder.status !== "PENDING") {
      return NextResponse.json({ error: "Invalid order state for verification." }, { status: 400 });
    }

    // 🛡️ FIX 1: Expiry Check (Time Manipulation Protection)
    if (existingOrder.expiresAt && new Date() > existingOrder.expiresAt) {
      return NextResponse.json({ error: "Order session has expired. Please create a new order." }, { status: 400 });
    }

    // 🛡️ FIX 4: Real Razorpay Amount Cross-Check (Critical Fraud Protection)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    
    // DB amount (Rupees) ko Paise mein convert karke match kar rahe hain
    const expectedAmountInPaise = Math.round(existingOrder.amount * 100);
    
    if (rzpOrder.amount !== expectedAmountInPaise) {
       console.error(`🚨 Amount Mismatch! RZP: ${rzpOrder.amount}, DB: ${expectedAmountInPaise}`);
       return NextResponse.json({ error: "Payment amount mismatch detected. Transaction blocked." }, { status: 400 });
    }

    // 🏗️ 4. DATABASE TRANSACTION (All or Nothing)
    await prisma.$transaction(async (tx) => {
      
      // A. Update Order Status
      await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          status: "PROCESSING", // Order verified, send to dashboard for dispatch
          paymentId: razorpay_payment_id,
        },
      });

      // 🛡️ FIX 3: Safe Stock Update (Prevent Race Conditions & Negative Stock)
      for (const item of existingOrder.items) {
        if (item.productId && !item.productId.startsWith('custom')) {
            // Using update (not updateMany) with gte (Greater Than or Equal)
            // Agar stock item.quantity se kam hoga, toh Prisma Error fekega aur Transaction FAIL ho jayegi
            await tx.product.update({ 
              where: { 
                 id: item.productId,
                 stock: { gte: item.quantity } // Stock must be >= ordered quantity
              },
              data: { stock: { decrement: item.quantity } }
            });
        }
      }
    });

    return NextResponse.json({ success: true, orderId: existingOrder.id });

  } catch (error: any) {
    console.error("CRITICAL PAYMENT VERIFY ERROR:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }
    
    // If Prisma fails because stock was insufficient (where clause didn't match any record)
    if (error.code === 'P2025') {
       return NextResponse.json({ error: "One or more items went out of stock during payment. Refund will be initiated." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to verify payment. Please contact support." }, { status: 500 });
  }
}