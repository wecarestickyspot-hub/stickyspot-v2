import React from "react";

// 🛡️ FIX 1: Strict Typing for bulletproof production builds
export type ThemeType = "default" | "diwali" | "christmas" | "cyberpunk" | "valentine" | "holi" | "halloween";

type ThemeConfig = {
  orb1: string;
  orb2: string;
  particles: React.ReactNode | null;
};

// ⚡ FIX 3: Moved outside the component to prevent recreating object on every render!
const themeConfig: Record<ThemeType, ThemeConfig> = {
  default: {
    // ♿ FIX 4: Added 'motion-safe:' to prevent GPU lag on devices with 'reduced motion' enabled
    orb1: "bg-gradient-to-br from-indigo-400/40 via-purple-400/30 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tr from-sky-400/30 via-indigo-300/20 to-transparent motion-safe:animate-[float_20s_ease-in-out_infinite_reverse]",
    particles: null,
  },
  diwali: {
    orb1: "bg-gradient-to-br from-orange-500/40 via-yellow-500/30 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-amber-500/30 via-red-500/20 to-transparent motion-safe:animate-[float_18s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-60">
         <div className="absolute bottom-[-10%] left-[20%] w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_15px_#facc15] motion-safe:animate-[driftUp_6s_linear_infinite]" />
         <div className="absolute bottom-[-10%] right-[15%] w-3 h-3 bg-orange-400 rounded-full shadow-[0_0_20px_#fb923c] motion-safe:animate-[driftUp_8s_linear_infinite]" style={{ animationDelay: '2s' }} />
         <div className="absolute bottom-[-10%] left-[40%] w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_10px_#fde68a] motion-safe:animate-[driftUp_5s_linear_infinite]" style={{ animationDelay: '1s' }} />
         <div className="absolute bottom-[-10%] right-[40%] w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_15px_#eab308] motion-safe:animate-[driftUp_7s_linear_infinite]" style={{ animationDelay: '3s' }} />
      </div>
    ),
  },
  christmas: {
    orb1: "bg-gradient-to-br from-rose-400/30 via-red-400/20 to-transparent motion-safe:animate-[float_16s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-emerald-400/30 via-teal-300/20 to-transparent motion-safe:animate-[float_22s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-70">
         <div className="absolute top-[-10%] left-[10%] w-1.5 h-1.5 bg-sky-200 rounded-full shadow-[0_0_8px_#bae6fd] motion-safe:animate-[snow_6s_linear_infinite]" />
         <div className="absolute top-[-10%] right-[25%] w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#ffffff] motion-safe:animate-[snow_8s_linear_infinite]" style={{ animationDelay: '1.5s' }} />
         <div className="absolute top-[-10%] left-[40%] w-2.5 h-2.5 bg-indigo-100 rounded-full shadow-[0_0_15px_#e0e7ff] motion-safe:animate-[snow_10s_linear_infinite]" style={{ animationDelay: '3s' }} />
         <div className="absolute top-[-10%] right-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#ffffff] motion-safe:animate-[snow_5s_linear_infinite]" style={{ animationDelay: '0.5s' }} />
      </div>
    ),
  },
  cyberpunk: {
    orb1: "bg-gradient-to-br from-fuchsia-500/30 via-pink-500/20 to-transparent motion-safe:animate-[float_10s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tr from-cyan-400/40 via-blue-500/20 to-transparent motion-safe:animate-[float_12s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-50">
         <div className="absolute bottom-[-10%] left-[25%] w-1 h-4 bg-cyan-400 shadow-[0_0_12px_#22d3ee] motion-safe:animate-[driftUp_4s_linear_infinite]" />
         <div className="absolute bottom-[-10%] right-[30%] w-1.5 h-1.5 bg-fuchsia-500 shadow-[0_0_15px_#d946ef] motion-safe:animate-[driftUp_6s_linear_infinite]" style={{ animationDelay: '2s' }} />
      </div>
    ),
  },
  valentine: {
    orb1: "bg-gradient-to-br from-pink-400/40 via-rose-300/30 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-red-400/30 via-pink-200/20 to-transparent motion-safe:animate-[float_18s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-60">
         <div className="absolute bottom-[-10%] left-[20%] text-pink-400 text-xs motion-safe:animate-[driftUp_7s_linear_infinite] drop-shadow-[0_0_8px_#f472b6]">❤️</div>
         <div className="absolute bottom-[-10%] right-[25%] text-rose-400 text-sm motion-safe:animate-[driftUp_9s_linear_infinite] drop-shadow-[0_0_10px_#fb7185]" style={{ animationDelay: '2s' }}>💖</div>
      </div>
    ),
  },
  holi: {
    orb1: "bg-gradient-to-br from-magenta-500/40 via-yellow-400/30 to-transparent motion-safe:animate-[float_12s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-cyan-400/40 via-green-400/30 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-50">
         <div className="absolute top-[20%] left-[15%] w-24 h-24 bg-pink-400/20 blur-[40px] rounded-full motion-safe:animate-pulse" />
         <div className="absolute top-[40%] right-[20%] w-32 h-32 bg-cyan-400/20 blur-[50px] rounded-full motion-safe:animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    )
  },
  halloween: {
    orb1: "bg-gradient-to-br from-orange-500/40 via-red-500/30 to-transparent motion-safe:animate-[float_14s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-purple-700/40 via-indigo-600/30 to-transparent motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-50">
         <div className="absolute bottom-[-10%] left-[30%] w-2 h-2 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80] motion-safe:animate-[driftUp_6s_linear_infinite]" />
         <div className="absolute bottom-[-10%] right-[40%] w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316] motion-safe:animate-[driftUp_8s_linear_infinite]" style={{ animationDelay: '3s' }} />
      </div>
    )
  }
};

// ⚡ FIX 2: Completely removed 'use client', useState, and useEffect!
// This is now a blazing-fast Server Component.
export default function ThemeEngine({ activeTheme = "default" }: { activeTheme?: string }) {
  
  const safeTheme = (themeConfig[activeTheme as ThemeType] ? activeTheme : "default") as ThemeType;
  const currentSettings = themeConfig[safeTheme];

  return (
    <>
      {/* 🔮 Premium Floating Glass Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] transform-gpu transition-all duration-1000 ${currentSettings.orb1}`} />
        <div className={`absolute bottom-[-5%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] transform-gpu transition-all duration-1000 ${currentSettings.orb2}`} />
      </div>

      {/* ✨ Festive Particles */}
      {currentSettings.particles}
    </>
  );
}