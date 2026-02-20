import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import crypto from "crypto";

// 🛡️ 3. STRONG INPUT VALIDATION (No more z.any!)
const orderRequestSchema = z.object({
  items: z.array(z.object({
    productId: z.string(), 
    quantity: z.number().int().positive(),
    isCustom: z.boolean().optional(),
    customPrice: z.number().optional(),
    customTitle: z.string().optional(),
    customImage: z.string().optional(),
  })).min(1, "Cart cannot be empty"),
  couponCode: z.string().optional().nullable(),
  customerDetails: z.object({
    name: z.string().min(2, "Name too short").trim(),
    email: z.string().email("Invalid email").trim().toLowerCase(),
    phone: z.string().min(10, "Invalid phone").max(15, "Invalid phone").trim(),
    address: z.string().min(5, "Address too short").trim(),
    city: z.string().min(2, "City name too short").trim(),
    state: z.string().min(2, "State name too short").trim(),
    pincode: z.string().length(6, "Invalid Pincode").trim()
  }), 
  paymentMethod: z.enum(["prepaid", "cod"])
});

const VALID_CUSTOM_PACK_PRICES = [249, 399, 799]; 

export async function POST(req: Request) {
  try {
    // 🛡️ 4. Clerk Session ensures real users (Better than just Origin check)
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });

    const body = await req.json();
    const parsedData = orderRequestSchema.safeParse(body);
    if (!parsedData.success) {
        return NextResponse.json({ error: "Invalid order data format.", details: parsedData.error.format() }, { status: 400 });
    }

    const { items, couponCode, customerDetails, paymentMethod } = parsedData.data;

    // 🚀 Fetch Real Products
    const standardProductIds = items.filter(i => !i.isCustom).map(i => i.productId);
    const dbProducts = standardProductIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: standardProductIds } },
      select: { id: true, title: true, price: true, stock: true, images: true }
    }) : [];

    let subtotal = 0;
    const orderItemsForDb = [];

    // 🧮 Server-Side Math
    for (const item of items) {
      if (item.isCustom) {
         if (!item.customPrice || !VALID_CUSTOM_PACK_PRICES.includes(item.customPrice)) {
             return NextResponse.json({ error: "Price tampering detected." }, { status: 400 });
         }
         subtotal += item.customPrice * item.quantity;
         orderItemsForDb.push({
            productId: item.productId,
            title: item.customTitle || "Custom Sticker Pack",
            price: item.customPrice, 
            quantity: item.quantity,
            image: item.customImage || "",
         });
      } else {
         const product = dbProducts.find(p => p.id === item.productId);
         if (!product) return NextResponse.json({ error: `Product missing` }, { status: 404 });
         if (product.stock < item.quantity) return NextResponse.json({ error: `Out of stock: ${product.title}` }, { status: 400 });

         subtotal += product.price * item.quantity;
         orderItemsForDb.push({
           productId: product.id,
           title: product.title,
           price: product.price, 
           quantity: item.quantity,
           image: product.images[0] || "",
         });
      }
    }

    // 🚨 2. COD ELIGIBILITY CHECK (Minimum Order Value)
    if (paymentMethod === "cod" && subtotal < 299) {
        return NextResponse.json({ error: "COD is available only on orders above ₹299." }, { status: 400 });
    }

    // 🔐 7. REAL FRAUD CONTROL (RTO Block)
    if (paymentMethod === "cod") {
        const previousRTOs = await prisma.order.count({
            where: {
                phone: customerDetails.phone,
                status: "CANCELLED" // Assuming 'CANCELLED' or 'RTO' is your status for rejected orders
            }
        });

        if (previousRTOs >= 2) {
            return NextResponse.json({ 
                error: "COD is currently blocked for your account due to previous returns. Please use Prepaid." 
            }, { status: 403 });
        }
    }

    // 🧮 Fees & Discounts Math
    const settings = await prisma.storeSettings.findUnique({ where: { id: "global_settings" } });
    const threshold = settings?.freeShippingThreshold ?? 499;
    const charge = settings?.shippingCharge ?? 49;
    
    let shippingAmount = subtotal >= threshold ? 0 : charge;
    let couponDiscountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      // 💰 6. Coupon validation logic
      if (coupon && coupon.isActive && new Date() < new Date(coupon.endDate)) {
        couponDiscountAmount = coupon.discountType === "PERCENTAGE" 
          ? (subtotal * coupon.value) / 100 
          : coupon.value;
      }
    }

    // 💰 Smart Nudge Math
    let prepaidDiscount = 0;
    let codHandlingFee = 0;

    if (paymentMethod === "prepaid") {
        prepaidDiscount = Math.round(subtotal * 0.10); 
    } else {
        codHandlingFee = 50; 
    }

    const finalTotal = Math.max(0, subtotal - couponDiscountAmount - prepaidDiscount) + shippingAmount + codHandlingFee;

    // 🚀 Payment Gateway Logic
    let rzpOrderId = null;
    if (paymentMethod === "prepaid") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(finalTotal * 100), 
        currency: "INR",
        receipt: `rcpt_${crypto.randomBytes(4).toString("hex")}`,
        notes: { userId: user.id }
      });
      rzpOrderId = rzpOrder.id;
    }

    // 🚀 1. STATUS FIX & 8. FEE CLARITY
    // If COD -> "UNVERIFIED" (Requires admin/whatsapp call). If Prepaid -> "PENDING" (Waiting for payment).
    const orderStatus = paymentMethod === "cod" ? "UNVERIFIED" : "PENDING";

    const dbOrder = await prisma.order.create({
      data: {
        userId: user.id,
        customerName: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: `${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`,
        subtotal: subtotal,          
        shippingCost: shippingAmount + codHandlingFee, // Note: Consider making `codFee` a separate column in Prisma later
        discountAmount: couponDiscountAmount + prepaidDiscount,
        amount: finalTotal,
        status: orderStatus, // Fixed! No more direct processing.
        razorpayOrderId: rzpOrderId || `COD_${crypto.randomBytes(4).toString("hex")}`, 
        expiresAt: paymentMethod === "prepaid" ? new Date(Date.now() + 15 * 60 * 1000) : null, 
        items: { create: orderItemsForDb }
      }
    });

    
    // 🚀 Return Response
    if (paymentMethod === "cod") {
        
       return NextResponse.json({ success: true, dbOrderId: dbOrder.id });
    } else {
       return NextResponse.json({ 
          success: true, 
          amount: Math.round(finalTotal * 100), 
          razorpayOrderId: rzpOrderId, 
          dbOrderId: dbOrder.id 
       });
    }

  } catch (error: any) {
    console.error("❌ Checkout API Failed:", error);
    return NextResponse.json({ error: "Order Processing Failed" }, { status: 500 });
  }
}