import { auth } from "@clerk/nextjs/server";
import { Roles } from "@/types/globals";

// 🚀 FIX 3: Scalable Hierarchy Map
const roleHierarchy: Record<Roles, number> = {
  USER: 0,
  SUPPORT: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const checkRole = async (requiredRole: Roles): Promise<boolean> => {
  // 🛡️ Next.js 15 Fix: auth() ab async hai, isliye await zaroori hai
  const { sessionClaims } = await auth();

  // 🛡️ FIX 1: Safe Metadata Access
  // sessionClaims.metadata.role ko carefully extract kar rahe hain
  const userRole = sessionClaims?.metadata?.role as Roles | undefined;

  // Case 1: Agar user ke paas koi role nahi hai
  if (!userRole) {
      // Naye users default 'USER' hote hain
      if (requiredRole === "USER") return true;
      return false;
  }

  // ⚡ FIX 2: Numeric Comparison Logic
  // Check kar rahe hain ki user ka level required level se bada ya barabar hai
  const userPower = roleHierarchy[userRole] || 0;
  const requiredPower = roleHierarchy[requiredRole] || 0;

  return userPower >= requiredPower;
};