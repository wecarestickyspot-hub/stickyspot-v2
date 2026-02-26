import { NextResponse } from "next/server";
import { headers } from "next/headers";

// 🧠 1. IN-MEMORY TOKEN CACHING (Saves hundreds of API calls)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// 🛡️ 2. IN-MEMORY RATE LIMITER CONFIG
// Ek IP se 1 minute mein maximum 15 requests allowed hain
const ipMap = new Map();
const RATE_LIMIT = 15; 
const TIME_WINDOW = 60 * 1000; 

async function getShiprocketToken() {
  // Return cached token if it's still valid
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
    
    const data = await response.json();
    
    if (data.token) {
      cachedToken = data.token;
      // Shiprocket tokens last 24 hours. We cache for 23 hours to be safe.
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; 
      return cachedToken;
    }
    return null;
  } catch (error) {
    console.error("Token fetch error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // 🛡️ 3. IP-BASED RATE LIMITING EXECUTION
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown_ip";

    if (ip !== "unknown_ip") {
      const currentTime = Date.now();
      const ipData = ipMap.get(ip) || { count: 0, firstRequest: currentTime };

      if (currentTime - ipData.firstRequest > TIME_WINDOW) {
        // Time window expired, reset the count for this IP
        ipMap.set(ip, { count: 1, firstRequest: currentTime });
      } else if (ipData.count >= RATE_LIMIT) {
        // Too many requests within the window! Block them.
        console.warn(`🚨 Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json({ success: false, message: "Too many requests. Please try again after a minute." }, { status: 429 });
      } else {
        // Increment the request count
        ipMap.set(ip, { count: ipData.count + 1, firstRequest: ipData.firstRequest });
      }
    }

    const { pincode } = await req.json();

    // 🛡️ 4. STRICT INPUT SANITIZATION (Valid Indian Pincode check: No 000000)
    if (!pincode || !/^[1-9]\d{5}$/.test(pincode)) {
      return NextResponse.json({ success: false, message: "Invalid Pincode format" }, { status: 400 });
    }

    // Token laao (Ab ye 99% of the time instantly cache se aayega)
    const token = await getShiprocketToken();
    if (!token) {
      return NextResponse.json({ success: false, message: "Service unavailable temporarily" }, { status: 500 });
    }

    // 🚀 FIX: Correct Pickup Pincode (Dashboard ke hisaab se 332001)
    const pickupPincode = process.env.PICKUP_PINCODE || "332001";
    
    // 🚀 FIX: URL mein weight=0.5, cod=1 aur declared_value=250 fix kar diya hai
    const serviceUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${pincode}&weight=0.5&cod=1&declared_value=250`;

    // ⏱️ 5. TIMEOUT HANDLING (Prevents server freeze if Shiprocket is down)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 🚀 Badha kar 8 seconds kar diya cold starts ke liye

    const serviceabilityRes = await fetch(serviceUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    });

    clearTimeout(timeout); // Clear timeout if fetch succeeds

    const serviceData = await serviceabilityRes.json();

    // 🛡️ 6. SAFE NESTED DATA ACCESS (Optional Chaining)
    const couriers = serviceData?.data?.available_courier_companies || [];

    if (serviceData.status === 200 && couriers.length > 0) {
      
      // 🚀 7. PICK FASTEST COURIER (Sorting by delivery days)
      const fastestCourier = couriers.sort(
        (a: any, b: any) => a.estimated_delivery_days - b.estimated_delivery_days
      )[0]; 
      
      const etdDate = new Date(fastestCourier.etd);
      const formattedDate = etdDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

      // ⚡ 8. BROWSER/CDN CACHING (Cache identical pincode requests for 5 minutes)
      return NextResponse.json({
        success: true,
        city: serviceData.data.city || pincode,
        state: serviceData.data.state,
        date: formattedDate,
        cod: fastestCourier.cod === 1,
        isExpress: fastestCourier.estimated_delivery_days <= 3 
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60"
        }
      });

    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Delivery not available to this pincode." 
      }, {
        // Cache negative results for a short time too to prevent spam
        headers: { "Cache-Control": "public, s-maxage=60" }
      });
    }

  } catch (error: any) {
    // Check if error was caused by our AbortController timeout
    if (error.name === 'AbortError') {
      return NextResponse.json({ success: false, message: "Courier service took too long to respond" }, { status: 504 });
    }
    
    // Only log in production if it's a real unexpected error
    if (process.env.NODE_ENV !== "production") {
       console.error("Shiprocket API Error:", error);
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}