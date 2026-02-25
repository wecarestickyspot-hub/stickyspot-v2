import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Roles } from "@/types/globals";

// 1. PUBLIC ROUTES (Sirf wahi jo sach mein open hone chahiye)
const isPublicRoute = createRouteMatcher([
  "/",                // Home
  "/shop(.*)",        // Shop
  "/product(.*)",     // Product Details
  "/cart",            // Cart
  "/legal(.*)",       // 🚀 FIX: Privacy Policy, Terms, Refund, Shipping aadi ke liye
  "/contact",         // 🚀 FIX: Contact Us page
  "/api/webhooks(.*)",// Webhooks open for Razorpay/Stripe (Server-to-Server)
  "/sign-in(.*)",     // Login Page
  "/sign-up(.*)"      // Signup Page
]);

// 🚨 NOTE: /checkout, /api/razorpay, and /api/order are REMOVED from here.
// Ab inko access karne ke liye user ka logged-in hona zaroori hai.

// 2. ADMIN ROUTES
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Protect Non-Public Routes (Checkout, Order APIs, etc.)
  if (!isPublicRoute(req)) {
    await auth.protect(); 
  }

  // 2. Strict Admin Route Protection (Proper RBAC)
  if (isAdminRoute(req)) {
    const authObj = await auth(); 
    
    // Clerk Metadata se role nikalo
    const role = authObj.sessionClaims?.metadata?.role as Roles | undefined; 
    
    // Owner fallback (In case database is fresh or metadata is delayed)
    const userEmail = authObj.sessionClaims?.email as string | undefined;
    const isOwner = userEmail && userEmail === process.env.ADMIN_EMAIL;

    // 🔥 THE FIX: Agar Super Admin/Admin nahi hai AND Owner bhi nahi hai -> Kick out!
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && !isOwner) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Next.js internals aur static files ko chhod kar sab par check lagao
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};