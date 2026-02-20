import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// 🧠 1. IN-MEMORY TOKEN CACHING
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getShiprocketToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });

    if (!response.ok) throw new Error("Shiprocket auth failed");

    const data = await response.json();
    cachedToken = data.token;
    tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // Cache for 23 hours

    return cachedToken;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Token fetch error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // 🛡️ 1. ENTERPRISE RBAC (Strict Admin Check)
    const user = await currentUser();
    const role = (user?.publicMetadata?.role ?? "USER") as string;
    const adminEmail = process.env.ADMIN_EMAIL;
    const isOwner = adminEmail && user?.emailAddresses?.some(e => e.emailAddress === adminEmail);

    if (!user || (role !== "SUPER_ADMIN" && role !== "ADMIN" && !isOwner)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admins only." }, { status: 403 });
    }

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, message: "Order ID missing" }, { status: 400 });

    // 📦 2. Fetch Order & Items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

    // 🛑 3. LIFECYCLE & IDEMPOTENCY GUARDS
    if (order.status !== "PAID" && order.status !== "PROCESSING") {
      return NextResponse.json({ success: false, message: `Cannot ship order with status: ${order.status}` }, { status: 400 });
    }

    // Checking if already has an AWB (Add trackingNumber to your prisma schema!)
    // (order.status as string) lagane se hum TS ko bolte hain: "Dimag mat laga, string ki tarah check kar"
    if ((order.status as string) === "SHIPPED" || (order as any).trackingNumber) {
      return NextResponse.json({ success: false, message: "Order is already shipped or has an AWB." }, { status: 400 });
    }

    // 🔑 4. Fetch Token
    const token = await getShiprocketToken();
    if (!token) return NextResponse.json({ success: false, message: "Shiprocket Auth Failed" }, { status: 500 });

    // 📝 5. Smart Address Parsing (Hack for combined address string)
    // Assuming format: "Address, City, State - Pincode" (from your CheckoutPage)
    const addressParts = order.address.split(',');
    const cityStatePincode = addressParts.length > 1 ? addressParts[addressParts.length - 2] + addressParts[addressParts.length - 1] : "";

    const pincodeMatch = order.address.match(/\b\d{6}\b/);
    const extractedPincode = pincodeMatch ? pincodeMatch[0] : "302001";

    // Fallback logic: If we can't extract city/state properly, we pass "Other" to let Shiprocket auto-detect via Pincode
    const extractedCity = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : "Other";
    const extractedState = addressParts.length > 2 ? addressParts[addressParts.length - 1].replace(/-\s*\d{6}/, '').trim() : "Other";

    const nameParts = order.customerName.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Name";

    const orderPayload = {
      order_id: order.id,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.address.slice(0, 80), // Shiprocket limits length
      billing_city: extractedCity,
      billing_pincode: extractedPincode,
      billing_state: extractedState,
      billing_country: "India",
      billing_email: order.email || "customer@stickyspot.in",
      billing_phone: order.phone || "9999999999",
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.title.slice(0, 50),
        sku: `SKU-${item.productId.slice(-6).toUpperCase()}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: "",
        hsn: 49119100 // Tariff code for Stickers
      })),
      payment_method: "Prepaid",
      sub_total: order.amount,
      length: 10, breadth: 10, height: 2, weight: 0.1
    };

    // 🚀 6. Step 1: Create Order in Shiprocket
    const createOrderRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(orderPayload),
    });

    if (!createOrderRes.ok) {
      const errJson = await createOrderRes.json();
      throw new Error(errJson.message || "Shiprocket Create Order API failed");
    }
    const orderData = await createOrderRes.json();

    if (orderData.status_code === 1) {
      const shipmentId = orderData.shipment_id;

      // 🏷️ 7. Step 2: Generate AWB
      const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ shipment_id: shipmentId }),
      });

      if (!awbRes.ok) throw new Error("Shiprocket AWB API failed");
      const awbData = await awbRes.json();

      if (awbData.awb_assign_status === 1) {
        const trackingNumber = awbData.response.data.awb_code;
        const courierName = awbData.response.data.courier_name;

        // 📄 8. Step 3: Get Label PDF URL
        const labelRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/print/awb", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ shipment_id: [shipmentId] }),
        });

        let labelUrl = "";
        if (labelRes.ok) {
          const labelData = await labelRes.json();
          labelUrl = labelData.label_url || "";
        }

        // 🏗️ 9. Atomic Database Update
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "SHIPPED",
            trackingNumber: trackingNumber, // ⚠️ Update Prisma schema: trackingNumber String?
            trackingUrl: labelUrl,          // ⚠️ Update Prisma schema: trackingUrl String?
            courierName: courierName        // ⚠️ Update Prisma schema: courierName String?
          }
        });

        return NextResponse.json({
          success: true,
          awb: trackingNumber,
          courier: courierName,
          label_url: labelUrl, // Now frontend can download the PDF!
          message: "Label Generated & Order Shipped!"
        });
      } else {
        return NextResponse.json({ success: false, message: "Order created, but courier assignment failed. Pincode issue?" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, message: orderData.message || "Failed to create Shiprocket order." }, { status: 400 });
    }

  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") console.error("Generate Label API Error:", error.message || error);
    return NextResponse.json({ success: false, message: "Server error or Invalid address format." }, { status: 500 });
  }
}