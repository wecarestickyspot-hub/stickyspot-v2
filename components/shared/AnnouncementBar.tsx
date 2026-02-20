import { prisma } from "@/lib/prisma";
import { Zap } from "lucide-react";
import CopyCouponBtn from "./CopyCouponBtn";
import { cache } from "react";

// 🔥 FIX 1A: Next.js Cache Revalidation
// Tell Next.js to cache this component's output for 1 hour (3600 seconds).
// Database will only be hit once per hour globally, saving massive DB costs!
export const revalidate = 3600; 

// 🔥 FIX 1B: React Cache Wrapper
// Ensures if multiple components request settings in the same render cycle, 
// Prisma only queries the DB once.
const getSettings = cache(async () => {
  return prisma.storeSettings.findUnique({
    where: { id: "global_settings" }
  });
});

export default async function AnnouncementBar() {
  const settings = await getSettings();

  // 🛡️ FIX 2: Safer null checks
  // Don't render if settings don't exist, announcement is toggled off, or text is empty.
  if (!settings || !settings.showAnnouncement || !settings.announcementText) return null;

  return (
    // ⚡ FIX 4 & ✨ UX FIX: Added 'top-0' for reliable sticky behavior.
    // Added Tailwind animate-in for a smooth premium slide-down effect.
    <div className="sticky top-0 bg-slate-900 text-white w-full py-2.5 px-4 z-[100] border-b border-white/5 shadow-md animate-in slide-in-from-top-full fade-in duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        
        {/* Left Icon */}
        <Zap size={14} className="fill-indigo-500 text-indigo-500 hidden sm:block animate-pulse shrink-0" />
        
        {/* Main Text & Coupon Logic Wrapper */}
        <div className="flex items-center flex-wrap justify-center gap-2">
          
          {/* 🛡️ FIX 3: Added 'truncate max-w-[250px] sm:max-w-lg' to prevent layout break if admin pastes 1000 words */}
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] leading-none truncate max-w-[250px] sm:max-w-lg">
            {settings.announcementText}
          </p>

          {/* 🛡️ FIX 2: Conditionally render the Coupon section ONLY if a code actually exists */}
          {settings.couponCode && (
            <>
              <span className="text-slate-500 hidden sm:inline">—</span> 
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-slate-300">
                Use Code:
              </span>
              <CopyCouponBtn code={settings.couponCode} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}