import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    const record = await prisma.verificationToken.findUnique({ where: { phone } });

    if (!record || record.token !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
    }

    // ✅ Match success! Token delete kar do taaki dobara use na ho
    await prisma.verificationToken.delete({ where: { phone } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
  }
}