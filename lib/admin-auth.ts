import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// 🛡️ Define Valid Roles explicitly
type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export async function requireAdmin() {
  const user = await currentUser();

  // 1. Agar user login hi nahi hai -> Sign In par bhejo
  if (!user) {
    redirect("/sign-in");
  }

  // 2. 🛡️ Safe Data Extraction (Crash Proofing)
  // Optional chaining (?.) use kiya taaki agar array empty ho to undefined mile, crash na ho
  const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
  
  // Type Assertion ki jagah Type Narrowing
  const role = (user.publicMetadata?.role as UserRole) || "USER";

  // 3. 👑 Owner Check (Ultimate Power via .env)
  const isOwner = 
    primaryEmail && 
    process.env.ADMIN_EMAIL && 
    primaryEmail === process.env.ADMIN_EMAIL;

  // 4. 👮 Role Check (Logic Fixed: Allow ADMIN too)
  // Ab ye function 'SUPER_ADMIN' aur 'ADMIN' dono ko allow karega
  const hasAccess = isOwner || role === "SUPER_ADMIN" || role === "ADMIN";

  if (!hasAccess) {
    // 5. 🚫 Better UX: Error throw karne ki jagah Home pe redirect karo
    // (User ko pata bhi nahi chalega ki ye page exist karta hai)
    redirect("/");
  }

  // 6. Return Clean Data
  return { 
    id: user.id, 
    email: primaryEmail || "no-email-found", // Fallback string
    role: role 
  };
}