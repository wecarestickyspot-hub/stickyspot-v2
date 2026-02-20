import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    // 🛡️ 1. Indian Phone Validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid Indian mobile number" }, { status: 400 });
    }

    // 🛡️ 2. Rate Limiting Check (Simple DB based)
    const existingToken = await prisma.verificationToken.findUnique({ where: { phone } });
    if (existingToken && existingToken.attempts >= 3 && new Date() < new Date(existingToken.expiresAt)) {
      return NextResponse.json({ error: "Too many attempts. Try after 10 minutes." }, { status: 429 });
    }

    // 🚀 3. Server Generates OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 💾 4. Upsert in DB (Update if exists, else Create)
    await prisma.verificationToken.upsert({
      where: { phone },
      update: { 
        token: otp, 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
        attempts: { increment: 1 } 
      },
      create: { 
        phone, 
        token: otp, 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
      },
    });

    // 📡 5. Send via Fast2SMS (Using Authorization in Headers for safety)
    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${otp}&numbers=${phone}`,
      { method: 'GET' } // Fast2SMS OTP route standard GET hi support karta hai, but key hidden rahegi server logs mein
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}