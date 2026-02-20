import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// 🛡️ IN-MEMORY RATE LIMITER (Prevents Search Spam / Scraping Bots)
const ipMap = new Map();
const RATE_LIMIT = 30; // 30 searches per minute per IP (Generous for humans, strict for bots)
const TIME_WINDOW = 60 * 1000; 

export async function GET(req: Request) {
  try {
    // --- 🛡️ RATE LIMITING EXECUTION ---
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown_ip";

    if (ip !== "unknown_ip") {
      const currentTime = Date.now();
      const ipData = ipMap.get(ip) || { count: 0, firstRequest: currentTime };

      if (currentTime - ipData.firstRequest > TIME_WINDOW) {
        ipMap.set(ip, { count: 1, firstRequest: currentTime });
      } else if (ipData.count >= RATE_LIMIT) {
        console.warn(`🚨 Search Rate limit exceeded for IP: ${ip}`);
        // Return empty array with 429 status so frontend handles it gracefully
        return NextResponse.json([], { status: 429 });
      } else {
        ipMap.set(ip, { count: ipData.count + 1, firstRequest: ipData.firstRequest });
      }
    }
    // -----------------------------------

    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q");

    // 🛡️ 1. Minimum Length Check (Prevents DB scanning for single letters)
    if (!rawQuery || rawQuery.trim().length < 2) {
      return NextResponse.json([]);
    }

    // 🛡️ 2. Advanced String Sanitization (Removes weird symbols, prevents injection)
    // Only allows alphanumeric characters, spaces, and hyphens
    const safeQuery = rawQuery.replace(/[^\w\s-]/gi, '').trim().slice(0, 50);

    // Re-check length after sanitization
    if (safeQuery.length < 2) {
        return NextResponse.json([]);
    }

    // 🚀 3. Optimized Database Fetch (No Overfetching)
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: safeQuery, mode: "insensitive" } },
          { category: { contains: safeQuery, mode: "insensitive" } },
        ],
        status: "ACTIVE", // Sirf live products dikhao, drafts nahi
      },
      // 🔒 Sirf wahi data select karo jo frontend dropdown ko chahiye
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        category: true, // 🚨 CRITICAL FIX: Added because frontend needs it!
        images: true, 
      },
      take: 6, // Dropdown ke liye top 6 results kafi hain
    });

    // ⚡ 4. Edge Caching Headers (Huge Performance Boost)
    // Same search query ko 60 seconds tak cache karega, DB hit bachayega
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
      }
    });

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
       console.error("Search API Error:", error);
    }
    // Error aane par bhi empty array bhejo taaki frontend crash na ho
    return NextResponse.json([], { status: 500 });
  }
}