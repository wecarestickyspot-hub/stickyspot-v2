import { prisma } from "@/lib/prisma";
import ThemeSwitcher from "@/components/admin/ThemeSwitcher";
import HeroImageManager from "@/components/admin/HeroImageManager"; 
import ShippingManager from "@/components/admin/ShippingManager";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import { Settings2, LayoutDashboard } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server"; // ✅ FIX 1: Admin Guard Imports
import { redirect } from "next/navigation";

// ✅ FIX 4: Complete Cache Hardening
export const dynamic = "force-dynamic";
export const revalidate = 0; 

export default async function AdminSettingsPage() {
  // 🔒 FIX 1: Server-Side Admin Guard (Absolute Mandatory)
  const user = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!user || user.emailAddresses[0]?.emailAddress !== adminEmail) {
    redirect("/"); // Kick out unauthorized users
  }

  // ✅ FIX 3: Enforcing Single-Row Pattern instead of random findFirst()
  // Ensure your DB schema has `id String @id @default("global_settings")`
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "global_settings" }
  });

  // ✅ FIX 2: Null Safety & Defaults (Perfectly handled via fallbacks)
  const currentTheme = settings?.theme || "default";
  const currentHeroImage = settings?.heroImage || null;
  const currentThreshold = settings?.freeShippingThreshold ?? 499; 
  const currentCharge = settings?.shippingCharge ?? 49;

  // Announcement details pass karne ke liye object banaya
  const announcementSettings = {
    announcementText: settings?.announcementText,
    couponCode: settings?.couponCode,
    showAnnouncement: settings?.showAnnouncement ?? true
  };

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
      
      {/* 🏷️ Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
            <LayoutDashboard size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Global Config</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-3 leading-tight">
            Store <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg max-w-md">
            Your centralized control panel for branding, shipping, and marketing offers.
          </p>
        </div>
      </div>

      {/* 🧱 Settings Grid Layout */}
      <div className="flex flex-col gap-10">
        
        {/* 📢 1. Announcement Manager (Top Priority for Marketing) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           <AnnouncementManager settings={announcementSettings} />
        </div>

        {/* 🎨 2. Theme Switcher (Visual Identity) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <ThemeSwitcher currentTheme={currentTheme} />
        </div>
        
        {/* 🖼️ 3. Hero Image Manager (Landing Page Impact) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <HeroImageManager currentImage={currentHeroImage} />
        </div>

        {/* 🚚 4. Shipping Manager (Operations) */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <ShippingManager currentThreshold={currentThreshold} currentCharge={currentCharge} />
        </div>
        
      </div>

      {/* Footer Info */}
      <div className="mt-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] pt-10 border-t border-slate-100">
          StickySpot Pro Admin v2.0
      </div>
      
    </div>
  );
}