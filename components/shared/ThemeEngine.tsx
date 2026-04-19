import React from "react";

// 🛡️ Strict Typing
export type ThemeType =
  | "default"
  | "diwali"
  | "christmas"
  | "cyberpunk"
  | "valentine"
  | "holi"
  | "halloween"
  | "newYear"
  | "independence";

type ThemeConfig = {
  orb1: string;
  orb2: string;
  orb3?: string;
  particles: React.ReactNode | null;
  label?: string;
};

// ─────────────────────────────────────────────
// 🗓️ AUTO FESTIVAL DETECTION (Server-side safe)
// Returns festival theme based on current date
// ─────────────────────────────────────────────
export function getAutoTheme(): ThemeType {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // New Year: Jan 1-3
  if (month === 1 && day <= 3) return "newYear";
  // Valentine: Feb 10-14
  if (month === 2 && day >= 10 && day <= 14) return "valentine";
  // Holi: March (approximate window)
  if (month === 3 && day >= 20 && day <= 30) return "holi";
  // Independence Day: Aug 13-15
  if (month === 8 && day >= 13 && day <= 15) return "independence";
  // Halloween: Oct 28-31
  if (month === 10 && day >= 28) return "halloween";
  // Diwali: Oct 20 - Nov 5 (approximate)
  if ((month === 10 && day >= 20) || (month === 11 && day <= 5)) return "diwali";
  // Christmas: Dec 20-26
  if (month === 12 && day >= 20 && day <= 26) return "christmas";
  // New Year Eve: Dec 29-31
  if (month === 12 && day >= 29) return "newYear";

  return "default";
}

// ─────────────────────────────────────────────
// 🎨 THEME CONFIGS
// Mobile optimized: blur reduced from 120px → 80px
// Added orb3 for richer depth on larger screens
// ─────────────────────────────────────────────
const themeConfig: Record<ThemeType, ThemeConfig> = {
  default: {
    orb1: "bg-gradient-to-br from-indigo-400/35 via-purple-400/25 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tr from-sky-400/25 via-indigo-300/15 to-transparent motion-safe:animate-[float_20s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-bl from-violet-300/20 via-fuchsia-200/10 to-transparent motion-safe:animate-[float_18s_ease-in-out_infinite]",
    particles: null,
    label: "Default",
  },

  diwali: {
    orb1: "bg-gradient-to-br from-orange-500/40 via-yellow-500/30 to-transparent motion-safe:animate-[float_12s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-amber-500/30 via-red-500/20 to-transparent motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-yellow-300/20 via-orange-200/10 to-transparent motion-safe:animate-[float_14s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Floating diyas / embers */}
        {[
          { left: "10%", delay: "0s", size: "w-2 h-2", color: "bg-yellow-400", glow: "#facc15", dur: "6s" },
          { left: "25%", delay: "1.5s", size: "w-3 h-3", color: "bg-orange-400", glow: "#fb923c", dur: "8s" },
          { left: "42%", delay: "0.8s", size: "w-1.5 h-1.5", color: "bg-amber-200", glow: "#fde68a", dur: "5s" },
          { left: "60%", delay: "2.5s", size: "w-2 h-2", color: "bg-yellow-500", glow: "#eab308", dur: "7s" },
          { left: "75%", delay: "1s", size: "w-2.5 h-2.5", color: "bg-red-400", glow: "#f87171", dur: "9s" },
          { left: "88%", delay: "3s", size: "w-1.5 h-1.5", color: "bg-amber-400", glow: "#fbbf24", dur: "6.5s" },
        ].map((p, i) => (
          <div
            key={i}
            className={`absolute bottom-[-10%] ${p.size} ${p.color} rounded-full opacity-75 motion-safe:animate-[driftUp_var(--dur)_linear_infinite]`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
              boxShadow: `0 0 12px ${p.glow}, 0 0 24px ${p.glow}55`,
            }}
          />
        ))}
      </div>
    ),
    label: "🪔 Diwali",
  },

  christmas: {
    orb1: "bg-gradient-to-br from-rose-400/25 via-red-400/15 to-transparent motion-safe:animate-[float_16s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-emerald-400/25 via-teal-300/15 to-transparent motion-safe:animate-[float_22s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-green-300/20 via-red-200/10 to-transparent motion-safe:animate-[float_19s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[
          { left: "8%", delay: "0s", size: "w-2 h-2", dur: "7s" },
          { left: "22%", delay: "1.5s", size: "w-1.5 h-1.5", dur: "9s" },
          { left: "38%", delay: "0.5s", size: "w-2.5 h-2.5", dur: "6s" },
          { left: "55%", delay: "2s", size: "w-1 h-1", dur: "8s" },
          { left: "70%", delay: "3s", size: "w-2 h-2", dur: "10s" },
          { left: "85%", delay: "1s", size: "w-1.5 h-1.5", dur: "7.5s" },
          { left: "94%", delay: "4s", size: "w-1 h-1", dur: "6.5s" },
        ].map((p, i) => (
          <div
            key={i}
            className={`absolute top-[-10%] ${p.size} bg-white rounded-full opacity-80 motion-safe:animate-[snow_var(--dur)_linear_infinite]`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
              boxShadow: "0 0 8px #ffffff, 0 0 16px #bae6fd",
            }}
          />
        ))}
      </div>
    ),
    label: "🎄 Christmas",
  },

  newYear: {
    orb1: "bg-gradient-to-br from-yellow-400/35 via-amber-300/25 to-transparent motion-safe:animate-[float_10s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-indigo-400/30 via-violet-300/20 to-transparent motion-safe:animate-[float_13s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-pink-300/25 via-rose-200/15 to-transparent motion-safe:animate-[float_11s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Confetti-like sparkles */}
        {["✨", "🎊", "⭐", "💫", "🌟", "✨", "🎉"].map((emoji, i) => (
          <div
            key={i}
            className="absolute top-[-10%] text-sm motion-safe:animate-[snow_linear_infinite] opacity-70"
            style={{
              left: `${10 + i * 13}%`,
              animationDuration: `${5 + i * 1.2}s`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    ),
    label: "🎆 New Year",
  },

  independence: {
    orb1: "bg-gradient-to-br from-orange-500/35 via-orange-400/20 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-green-500/35 via-green-400/20 to-transparent motion-safe:animate-[float_18s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-blue-400/25 via-blue-300/15 to-transparent motion-safe:animate-[float_13s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Tiranga colors floating */}
        {[
          { color: "bg-orange-500", left: "15%", delay: "0s", dur: "7s" },
          { color: "bg-white", left: "30%", delay: "1s", dur: "8s" },
          { color: "bg-green-600", left: "50%", delay: "0.5s", dur: "6.5s" },
          { color: "bg-orange-400", left: "65%", delay: "2s", dur: "9s" },
          { color: "bg-green-500", left: "80%", delay: "1.5s", dur: "7.5s" },
        ].map((p, i) => (
          <div
            key={i}
            className={`absolute bottom-[-10%] w-2 h-2 ${p.color} rounded-full opacity-70 motion-safe:animate-[driftUp_linear_infinite]`}
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
          />
        ))}
      </div>
    ),
    label: "🇮🇳 Independence Day",
  },

  cyberpunk: {
    orb1: "bg-gradient-to-br from-fuchsia-500/30 via-pink-500/20 to-transparent motion-safe:animate-[float_8s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tr from-cyan-400/35 via-blue-500/20 to-transparent motion-safe:animate-[float_11s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-bl from-lime-400/20 via-emerald-300/10 to-transparent motion-safe:animate-[float_9s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-60">
        {[
          { left: "20%", color: "bg-cyan-400", glow: "#22d3ee", w: "w-0.5", h: "h-6", delay: "0s", dur: "3s" },
          { left: "35%", color: "bg-fuchsia-500", glow: "#d946ef", w: "w-1", h: "h-1", delay: "1s", dur: "5s" },
          { left: "55%", color: "bg-cyan-300", glow: "#67e8f9", w: "w-0.5", h: "h-4", delay: "0.5s", dur: "4s" },
          { left: "72%", color: "bg-pink-400", glow: "#f472b6", w: "w-1.5", h: "h-1.5", delay: "2s", dur: "6s" },
        ].map((p, i) => (
          <div
            key={i}
            className={`absolute bottom-[-10%] ${p.w} ${p.h} ${p.color} motion-safe:animate-[driftUp_linear_infinite]`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.dur,
              boxShadow: `0 0 10px ${p.glow}`,
            }}
          />
        ))}
      </div>
    ),
    label: "🤖 Cyberpunk",
  },

  valentine: {
    orb1: "bg-gradient-to-br from-pink-400/35 via-rose-300/25 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-red-400/25 via-pink-200/15 to-transparent motion-safe:animate-[float_18s_ease-in-out_infinite_reverse]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {["❤️", "💖", "💝", "💕", "🩷", "💗"].map((emoji, i) => (
          <div
            key={i}
            className="absolute bottom-[-10%] text-sm motion-safe:animate-[driftUp_linear_infinite] opacity-65"
            style={{
              left: `${8 + i * 16}%`,
              animationDuration: `${6 + i * 1.5}s`,
              animationDelay: `${i * 1.2}s`,
              filter: "drop-shadow(0 0 6px #f472b6)",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    ),
    label: "💝 Valentine",
  },

  holi: {
    orb1: "bg-gradient-to-br from-pink-500/35 via-yellow-400/25 to-transparent motion-safe:animate-[float_12s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-cyan-400/35 via-green-400/25 to-transparent motion-safe:animate-[float_15s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-purple-400/25 via-orange-300/15 to-transparent motion-safe:animate-[float_10s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-50">
        <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-pink-400/25 blur-[50px] rounded-full motion-safe:animate-pulse" />
        <div className="absolute top-[35%] right-[15%] w-40 h-40 bg-cyan-400/20 blur-[60px] rounded-full motion-safe:animate-pulse" style={{ animationDelay: "0.8s" }} />
        <div className="absolute bottom-[20%] left-[35%] w-28 h-28 bg-yellow-400/20 blur-[45px] rounded-full motion-safe:animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[55%] left-[20%] w-24 h-24 bg-purple-400/20 blur-[40px] rounded-full motion-safe:animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    ),
    label: "🎨 Holi",
  },

  halloween: {
    orb1: "bg-gradient-to-br from-orange-500/35 via-red-500/25 to-transparent motion-safe:animate-[float_14s_ease-in-out_infinite]",
    orb2: "bg-gradient-to-tl from-purple-700/35 via-indigo-600/25 to-transparent motion-safe:animate-[float_16s_ease-in-out_infinite_reverse]",
    orb3: "bg-gradient-to-br from-gray-700/20 via-slate-600/10 to-transparent motion-safe:animate-[float_12s_ease-in-out_infinite]",
    particles: (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {["🎃", "👻", "🕷️", "🦇", "🕸️", "💀"].map((emoji, i) => (
          <div
            key={i}
            className="absolute bottom-[-10%] text-base motion-safe:animate-[driftUp_linear_infinite] opacity-60"
            style={{
              left: `${8 + i * 16}%`,
              animationDuration: `${7 + i * 1.3}s`,
              animationDelay: `${i * 1.1}s`,
              filter: "drop-shadow(0 0 6px #f97316)",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    ),
    label: "🎃 Halloween",
  },
};

// ─────────────────────────────────────────────
// 🚀 MAIN COMPONENT — Pure Server Component
// Pass activeTheme="auto" for festival auto-detection
// ─────────────────────────────────────────────
export default function ThemeEngine({
  activeTheme = "default",
}: {
  activeTheme?: ThemeType | "auto";
}) {
  // Auto-detect festival theme if "auto" is passed
  const resolvedTheme: ThemeType =
    activeTheme === "auto"
      ? getAutoTheme()
      : (themeConfig[activeTheme as ThemeType] ? activeTheme : "default") as ThemeType;

  const currentSettings = themeConfig[resolvedTheme];

  return (
    <>
      {/* 🔮 Background Orbs — Mobile optimized blur */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Orb 1 — Top Right */}
        <div
          className={`
            absolute top-[-10%] right-[-10%] 
            w-[60vw] h-[60vw] 
            sm:w-[50vw] sm:h-[50vw] 
            rounded-full 
            blur-[60px] sm:blur-[80px] 
            transform-gpu will-change-transform
            transition-all duration-1000
            ${currentSettings.orb1}
          `}
        />

        {/* Orb 2 — Bottom Left */}
        <div
          className={`
            absolute bottom-[-5%] left-[-10%] 
            w-[50vw] h-[50vw] 
            sm:w-[40vw] sm:h-[40vw] 
            rounded-full 
            blur-[50px] sm:blur-[70px] 
            transform-gpu will-change-transform
            transition-all duration-1000
            ${currentSettings.orb2}
          `}
        />

        {/* Orb 3 — Center (optional, only on sm+) */}
        {currentSettings.orb3 && (
          <div
            className={`
              hidden sm:block
              absolute top-[40%] left-[30%] 
              w-[35vw] h-[35vw] 
              rounded-full 
              blur-[90px] 
              transform-gpu will-change-transform
              transition-all duration-1000
              ${currentSettings.orb3}
            `}
          />
        )}
      </div>

      {/* ✨ Festive Particles */}
      {currentSettings.particles}
    </>
  );
}

// ─────────────────────────────────────────────
// 📦 USAGE EXAMPLES
//
// 1. Manual theme:
//    <ThemeEngine activeTheme="diwali" />
//
// 2. Auto festival detection:
//    <ThemeEngine activeTheme="auto" />
//
// 3. From URL param (in page.tsx):
//    const theme = searchParams.theme as ThemeType ?? "auto"
//    <ThemeEngine activeTheme={theme} />
// ─────────────────────────────────────────────