// lib/shiprocket.ts

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getShiprocketToken() {
  // 🛡️ 1. Strict ENV Check
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
    throw new Error("🚨 FATAL: Shiprocket credentials missing in .env file");
  }

  // ⚡ 2. Token Caching (4 hours safe expiry)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // 🔄 3. Fetch New Token
  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await response.json();

  // 💥 4. Strong Error Handling (No silent fails)
  if (!response.ok || !data.token) {
    throw new Error(`Shiprocket Auth Failed: ${data.message || 'Token missing from response'}`);
  }

  cachedToken = data.token;
  tokenExpiry = Date.now() + 4 * 60 * 60 * 1000; // 4 hours

  return cachedToken;
}

export async function createShiprocketOrder(orderPayload: any) {
  const token = await getShiprocketToken(); // Cache se aayega ya naya banega

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // 👈 Token inject ho gaya
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`❌ Shiprocket Order Creation Failed: ${JSON.stringify(data)}`);
  }

  // Success hone par Shiprocket humein Order ID aur Shipment ID dega
  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id,
    status: data.status,
  };
}

export async function pushOrderToShiprocket(dbOrder: any) {
  // 1. Shiprocket format mein data prepare karo
  const payload = {
    order_id: dbOrder.id.toString(), // Tumhara Prisma Order ID
    order_date: new Date(dbOrder.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
    pickup_location: "Home", // 🚨 NOTE: Shiprocket dashboard mein apne pickup location ka exact naam yahan likhna
    
    // Customer Details
    billing_customer_name: dbOrder.customerName,
    billing_last_name: "", // Agar last name alag se nahi hai toh blank chhod do
    billing_address: dbOrder.address, 
    billing_city: dbOrder.city,
    billing_pincode: dbOrder.pincode,
    billing_state: dbOrder.state,
    billing_country: "India",
    billing_email: dbOrder.email || "customer@stickyspot.in",
    billing_phone: dbOrder.phone,
    shipping_is_billing: true, // Same as billing address
    
    // Items Details
    order_items: dbOrder.items.map((item: any) => ({
      name: item.title,
      sku: item.id.toString(), // Sticker ka ID as SKU
      units: item.quantity,
      selling_price: item.price,
    })),
    
    // Payment & Package Specs (Stickers ke hisaab se)
    payment_method: "Prepaid", // Agar Razorpay hai toh Prepaid
    sub_total: dbOrder.amount,
    length: 15, // Envelope ki length (cm)
    breadth: 12, // Envelope ki breadth (cm)
    height: 2,   // Envelope ki height (cm)
    weight: 0.05 // 50 grams weight (kg mein)
  };

  // 2. Ab isko Shiprocket bhejo (Pichle step wala function call kar rahe hain)
  return await createShiprocketOrder(payload);
}

// 🏷️ AWB (Shipping Label) Generate Karne Ka Function
export async function generateAWB(shipmentId: string) {
  const token = await getShiprocketToken();

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: shipmentId
    }),
  });

  const data = await response.json();

  // Agar error aayi toh
  if (!response.ok || data.awb_assign_status !== 1) {
    console.error("AWB Error:", data);
    throw new Error(`AWB Generation Failed: ${data.message || 'Unknown Error'}`);
  }

  // Success hone par AWB Code return karo
  return {
    awbCode: data.response.data.awb_code,
    courierName: data.response.data.courier_name,
    routingCode: data.response.data.routing_code
  };
}

// 🏍️ Courier Boy ko Pickup ke liye Bulane ka Function
export async function requestPickup(shipmentId: string) {
  const token = await getShiprocketToken();

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/pickup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    // Shiprocket ko shipment_id ek array (list) mein chahiye hota hai
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }), 
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Pickup Error:", data);
    throw new Error("Failed to request pickup");
  }
  return data;
}

// 🖨️ Print karne ke liye Label (PDF) nikaalne ka Function
export async function generateLabel(shipmentId: string) {
  const token = await getShiprocketToken();

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label/print", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Label Error:", data);
    return null;
  }
  
  // Yeh humein ek PDF link dega jise hum print kar sakte hain
  return data.label_url; 
}