import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendOrderConfirmation } from "@/lib/sendEmail";
import { Prisma } from "@prisma/client"; // 🚀 NAYA: Type safety ke liye import kiya

export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); // Signature verification ke liye raw text chahiye
    const signature = req.headers.get("x-razorpay-signature");

    // 🛡️ 1. Verify Webhook Signature (Enterprise Security)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET as string)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ message: "Invalid Webhook Signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 🛡️ 2. Handle only successful payment events
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;
      const paymentAmount = payment.amount / 100; // Razorpay sends in paise

      // 🔄 3. Idempotency Check & Verification
      // Hum direct DB se PENDING order dhoondenge Razorpay Order ID use karke
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: razorpayOrderId },
        include: { items: true }
      });

      if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

      // Check if already processed (Idempotency)
      if (order.status === "PAID") {
        return NextResponse.json({ message: "Order already processed" }, { status: 200 });
      }

      // 🛡️ 4. Amount Revalidation (Crucial Protection)
      if (order.amount !== paymentAmount) {
        console.error("ALERT: Payment amount mismatch for order:", order.id);
        return NextResponse.json({ message: "Amount mismatch" }, { status: 400 });
      }

      // 🏗️ 5. Atomic Transaction (Database Safety)
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Mark Order as PAID
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: "PAID",
            paymentId: razorpayPaymentId // Storing Razorpay Payment ID
          }
        });

        // 📉 6. Deduct Stock Only Now!
        for (const item of order.items) {
          // 🚀 FIX: Sirf unhi items ka stock kam karo jinka asli productId hai (Custom Mug ko chhod do)
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } }
            });
          }
        }
      });

      // 📧 7. Send Confirmation Email
      await sendOrderConfirmation(
        order.email,
        order.customerName,
        order.id,
        order.amount,
        order.items
      );

      return NextResponse.json({ message: "Order Processed Successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Webhook Handler Failed" }, { status: 500 });
  }
}