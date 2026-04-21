import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    where: {
      isPublic: true,
      isActive: true,
      endDate: { gte: new Date() } // Expire nahi hua hona chahiye
    },
    select: { code: true, value: true, discountType: true, description: true }
  });
  return NextResponse.json(coupons);
}