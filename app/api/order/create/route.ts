import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client"; // 🚀 NAYA: TypeScript ke liye Prisma import kiya

// 🛡️ 1. Input Validation Schema (Zod)
const checkoutSchema = z.object({
  customerDetails: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
  }),
  cartItems: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
    image: z.string().optional(),
  })),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  couponCode: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate Input Structure
    const validatedData = checkoutSchema.parse(body);
    const { customerDetails, cartItems, razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } = validatedData;

    // 🛡️ 2. Razorpay Signature Verification (CRITICAL)
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed! 🚫" }, { status: 400 });
    }

    // 🚀 3. THE MAGIC SPLIT: Separate Normal Items from Custom Items
    const standardItems = cartItems.filter(item => !item.id.startsWith("custom-mug-"));
    const customItems = cartItems.filter(item => item.id.startsWith("custom-mug-"));

    // 🛡️ 4. Fetch Real Product Data ONLY for Standard Items
    let dbProducts: any[] = [];
    if (standardItems.length > 0) {
      dbProducts = await prisma.product.findMany({
        where: { id: { in: standardItems.map(item => item.id) } }
      });
    }

    let serverSubtotal = 0;

    // --- Process Standard Items ---
    for (const item of standardItems) {
      const product = dbProducts.find(p => p.id === item.id);
      if (!product) return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.title}` }, { status: 400 });
      }
      serverSubtotal += product.price * item.quantity;
    }

    // --- 🚀 Process Custom Items (Secure Server-Side Pricing) ---
    for (const item of customItems) {
      serverSubtotal += 299 * item.quantity; // Hacker price change nahi kar sakta!
    }

    // 🚀 5. THE SMART COUPON ENGINE
    let serverDiscount = 0;
    
    if (couponCode) {
      const codeUpper = couponCode.toUpperCase();

      if (codeUpper === "STICKY10") {
        const pastUsage = await prisma.order.findFirst({
          where: { 
            phone: customerDetails.phone, 
            couponCode: codeUpper,
            status: { not: "CANCELLED" } 
          }
        });

        if (pastUsage) {
          return NextResponse.json({ error: "Aap is code ko pehle hi use kar chuke hain! Naye offers try karein. 😉" }, { status: 400 });
        }

        const lastOrder = await prisma.order.findFirst({
          where: { phone: customerDetails.phone, status: { not: "CANCELLED" } },
          orderBy: { createdAt: 'desc' }
        });

        if (!lastOrder) {
          serverDiscount = Math.round(serverSubtotal * 0.10); 
        } else {
          const fortyDaysAgo = new Date();
          fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

          if (lastOrder.createdAt >= fortyDaysAgo) {
            serverDiscount = Math.round(serverSubtotal * 0.10); 
          } else {
            return NextResponse.json({ error: "Yeh code aapke last order ke 30 din tak hi valid tha. Agli baar jaldi aana! ⏰" }, { status: 400 });
          }
        }
      } else {
        const coupon = await prisma.coupon.findUnique({ where: { code: codeUpper } });
        if (coupon && coupon.isActive && new Date() <= new Date(coupon.endDate)) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            serverDiscount = coupon.discountType === "PERCENTAGE" 
              ? (serverSubtotal * coupon.value) / 100 
              : coupon.value;
          } else {
            return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 400 });
        }
      }
    }

    const serverFinalAmount = serverSubtotal - serverDiscount;

    // 🏗️ 6. DATABASE TRANSACTION (🚀 NAYA: Type add kiya tx mein)
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          customerName: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`,
          city: customerDetails.city,
          state: customerDetails.state,
          pincode: customerDetails.pincode,
          subtotal: serverSubtotal,
          discountAmount: serverDiscount,
          amount: serverFinalAmount,
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          status: "PAID",
          couponCode: couponCode,
          items: {
            create: cartItems.map((item) => {
              const isCustom = item.id.startsWith("custom-mug-");
              
              if (isCustom) {
                return {
                  title: "Premium Custom Photo Mug",
                  price: 299, 
                  quantity: item.quantity,
                  customImage: item.image, 
                };
              } else {
                const p = dbProducts.find(prod => prod.id === item.id)!;
                return {
                  productId: item.id,
                  title: p.title,
                  price: p.price, 
                  quantity: item.quantity,
                  image: p.images[0] || null
                };
              }
            }),
          },
        },
      });

      // Update Stock ONLY for standard products
      for (const item of standardItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (couponCode && couponCode.toUpperCase() !== "STICKY10") {
        await tx.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } }
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: result.id });

  } catch (error: any) {
    console.error("CRITICAL CHECKOUT ERROR:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
  }
}