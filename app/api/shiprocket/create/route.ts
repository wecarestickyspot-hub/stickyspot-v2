import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const pincodeMatch = order.address.match(/\b\d{6}\b/);
    const billing_pincode = pincodeMatch ? pincodeMatch[0] : "332001";

    const shiprocketPayload = {
      order_id: order.id,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary", 
      billing_customer_name: order.customerName,
      billing_last_name: "",
      billing_address: order.address,
      billing_city: "Sikar", 
      billing_pincode: billing_pincode,
      billing_state: "Rajasthan",
      billing_country: "India",
      billing_email: order.email || "wecarestickyspot@gmail.com",
      billing_phone: "9999999999", 
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.title,
        sku: item.id.slice(0, 8),
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: order.amount,
      length: 15,
      breadth: 15,
      height: 5,
      weight: 0.1 
    };

    const SHIPROCKET_TOKEN = process.env.SHIPROCKET_API_TOKEN; 

    const shipRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SHIPROCKET_TOKEN}`,
      },
      body: JSON.stringify(shiprocketPayload),
    });

    const shipData = await shipRes.json();

    if (shipData.status_code === 1) {
      // 💎 AUTO STATUS UPDATE: Database mein directly status "SHIPPED" kar diya
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED" } 
      });

      return NextResponse.json({ success: true, shipData });
    } else {
      console.error("Shiprocket Rejection:", shipData);
      return NextResponse.json({ message: shipData.message || "Shiprocket rejected the order" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}