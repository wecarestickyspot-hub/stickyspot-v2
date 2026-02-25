import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast"; 
import Footer from "@/components/shared/Footer";
import ThemeEngine from "@/components/shared/ThemeEngine";
import { prisma } from "@/lib/prisma"; 
import StoreInitializer from "@/components/shared/StoreInitializer"; 
import AnnouncementBar from "@/components/shared/AnnouncementBar";
import Navbar from "@/components/shared/Navbar";
import { cache } from "react";

// 🛡️ Google Analytics ki official library (Next.js isko by default optimize karta hai)
import { GoogleAnalytics } from '@next/third-parties/google';

// ⚡ FIX 3: Lazy Loading (CartDrawer sirf tab load hoga jab client-side ready ho)
import CartDrawerWrapper from "@/components/shop/CartDrawerWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // 🚀 LCP FIX: Text turant dikhega bina font ke download hone ka wait kiye!
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // 🚀 LCP FIX: Same here!
});

// ⚡ FIX 1: Layout Revalidation (Settings DB ko har 1 ghante mein sirf ek baar hit karega)
export const revalidate = 3600;

// 🚀 FIX 4: Advanced Dynamic SEO Metadata (Template + OpenGraph)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stickyspot.in"),
  title: {
    default: "StickySpot | Premium Waterproof Stickers",
    template: "%s | StickySpot",
  },
  description: "Discover industrial-grade, waterproof vinyl stickers for developers, creators, and artists.",
  verification: {
    // 🔍 Yahan apna Google Search Console ka code dalna (milne ke baad)
    google: "google-site-verification-code", 
  },
  openGraph: {
    title: "StickySpot - Premium Stickers",
    description: "Coolest stickers for devs and creators.",
    type: "website",
    siteName: "StickySpot",
  },
};

// ⚡ FIX 2: React Cache (Agar same request mein 2 jagah settings chahiye, toh DB call 1 hi bar jayega)
const getGlobalSettings = cache(async () => {
  try {
    return await prisma.storeSettings.findUnique({
      where: { id: "global_settings" } 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to load settings from DB:", error);
    }
    return null;
  }
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const settings = await getGlobalSettings();
  
  const activeTheme = settings?.theme || "default";
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 499;
  const shippingCharge = settings?.shippingCharge ?? 49;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8FAFC]`}>
        <ClerkProvider>
          
          <AnnouncementBar />

          <StoreInitializer threshold={freeShippingThreshold} charge={shippingCharge} />
          <ThemeEngine activeTheme={activeTheme} />
          
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1F1F1F',
                color: '#fff',
                borderRadius: '50px',
                fontWeight: 'bold'
              },
            }}
          />

          <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>

          <CartDrawerWrapper />
          
        </ClerkProvider>

        {/* 📊 Google Analytics Setup (Already non-blocking) */}
        <GoogleAnalytics gaId="G-1TF3QR67M8" />
      </body>
    </html>
  );
}