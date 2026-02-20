import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

// 🧠 FIX 3: Basic In-Memory Rate Limiting (Prevents signature spamming)
// Note: In a heavily scaled production app on Vercel, use Upstash Redis for this.
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const UPLOAD_LIMIT_PER_MINUTE = 10;

export async function POST(req: Request) {
  try {
    // 🔒 Sirf logged-in users hi upload kar sakte hain
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Rate Limit Check ---
    const now = Date.now();
    const userRate = rateLimitMap.get(user.id) || { count: 0, lastReset: now };
    if (now - userRate.lastReset > 60000) {
        userRate.count = 1;
        userRate.lastReset = now;
    } else {
        userRate.count++;
        if (userRate.count > UPLOAD_LIMIT_PER_MINUTE) {
            return NextResponse.json({ error: "Too many upload attempts. Slow down!" }, { status: 429 });
        }
    }
    rateLimitMap.set(user.id, userRate);
    // ------------------------

    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
        throw new Error("Cloudinary API Secret is missing in .env");
    }

    // 🛡️ FIX 1, 2 & 5: Strict Controlled Parameters
    // Har user ka apna folder hoga, aur image automatically max 2000px tak compress ho jayegi
    const folder = `stickyspot_custom/${user.id}`;
    const eager = "w_2000,c_limit"; 

    // 🔐 ALPHABETICAL SORTING IS MANDATORY FOR CLOUDINARY SIGNATURES!
    const paramsToSign = `eager=${eager}&folder=${folder}&timestamp=${timestamp}`;

    const signature = crypto
      .createHash("sha1")
      .update(`${paramsToSign}${apiSecret}`)
      .digest("hex");

    return NextResponse.json({ 
        signature, 
        timestamp, 
        folder,
        eager,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY 
    });

  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}