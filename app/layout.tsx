import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast"; 
import Footer from "@/components/shared/Footer";
import ThemeEngine, { ThemeType } from "@/components/shared/ThemeEngine";
import { prisma } from "@/lib/prisma"; 
import StoreInitializer from "@/components/shared/StoreInitializer"; 
import AnnouncementBar from "@/components/shared/AnnouncementBar";
import Navbar from "@/components/shared/Navbar";
import { cache } from "react";

// 🛡️ Google Analytics ki official library
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
  display: "swap", 
});

// ⚡ FIX 1: Layout Revalidation (Settings DB ko har 1 ghante mein sirf ek baar hit karega)
export const revalidate = 3600;

// 🚀 10X ADVANCED SEO METADATA
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stickyspot.in"),
  title: {
    default: "StickySpot | Premium Vinyl Stickers & Custom Mugs",
    template: "%s | StickySpot",
  },
  description: "Upgrade your workspace with industrial-grade, waterproof vinyl stickers and premium custom ceramic mugs. Built for developers, creators, and artists in India.",
  keywords: [
    "premium stickers", 
    "laptop stickers India", 
    "custom mugs online", 
    "waterproof vinyl stickers", 
    "developer stickers", 
    "StickySpot",
    "anime stickers"
  ],
  authors: [{ name: "StickySpot Team" }],
  creator: "StickySpot",
  publisher: "StickySpot",
  alternates: {
    canonical: "/", // Duplicate content penalty se bachayega
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // ⚠️ GOOGLE SEARCH CONSOLE STRING YAHAN PASTE KAREIN 👇
    google: "YAHAN_APNA_COPY_KIYA_HUA_CODE_PASTE_KAREIN", 
  },
  openGraph: {
    title: "StickySpot | Premium Stickers & Custom Mugs",
    description: "Upgrade your workspace with premium waterproof stickers and personalized mugs.",
    url: "https://stickyspot.in",
    siteName: "StickySpot",
    images: [
      {
        url: "/og-image.jpg", // 💡 Tip: public folder mein 'og-image.jpg' naam ki ek 1200x630px banner photo daal dena
        width: 1200,
        height: 630,
        alt: "StickySpot Premium Merchandise",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StickySpot | Premium Stickers & Custom Mugs",
    description: "Upgrade your workspace with premium waterproof stickers and personalized mugs. Fast shipping across India.",
    images: ["/og-image.jpg"],
  },
};

// ⚡ FIX 2: React Cache 
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
          <ThemeEngine activeTheme={(activeTheme ?? "default") as "auto" | ThemeType} />
          
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

        {/* 📊 Google Analytics Setup */}
        <GoogleAnalytics gaId="G-1TF3QR67M8" />
      </body>
    </html>
  );
}