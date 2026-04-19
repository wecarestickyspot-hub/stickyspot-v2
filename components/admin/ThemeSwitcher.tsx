"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "@/lib/actions";
import {
  Sparkles,
  Snowflake,
  Monitor,
  Loader2,
  Cpu,
  Heart,
  Palette,
  Ghost,
  Wand2,
  Flag,
  PartyPopper,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Theme definitions — single source of truth
// ─────────────────────────────────────────────
const themes = [
  {
    id: "default",
    name: "Premium Light",
    emoji: "✨",
    icon: <Monitor size={18} />,
    preview: "from-indigo-400 via-purple-400 to-sky-400",
    activeClass:
      "bg-indigo-50 border-indigo-300 text-indigo-700 ring-4 ring-indigo-500/20",
    desc: "Always on",
  },
  {
    id: "auto",
    name: "Auto Detect",
    emoji: "🗓️",
    icon: <Wand2 size={18} />,
    preview: "from-violet-400 via-fuchsia-400 to-pink-400",
    activeClass:
      "bg-violet-50 border-violet-300 text-violet-700 ring-4 ring-violet-500/20",
    desc: "Festival auto",
  },
  {
    id: "diwali",
    name: "Diwali Gold",
    emoji: "🪔",
    icon: <Sparkles size={18} />,
    preview: "from-orange-400 via-yellow-400 to-amber-400",
    activeClass:
      "bg-amber-50 border-amber-300 text-amber-700 ring-4 ring-amber-500/20",
    desc: "Oct–Nov",
  },
  {
    id: "christmas",
    name: "Christmas",
    emoji: "🎄",
    icon: <Snowflake size={18} />,
    preview: "from-rose-400 via-red-400 to-emerald-400",
    activeClass:
      "bg-rose-50 border-rose-300 text-rose-700 ring-4 ring-rose-500/20",
    desc: "Dec 20–26",
  },
  {
    id: "newYear",
    name: "New Year",
    emoji: "🎆",
    icon: <PartyPopper size={18} />,
    preview: "from-yellow-300 via-indigo-400 to-pink-400",
    activeClass:
      "bg-yellow-50 border-yellow-300 text-yellow-700 ring-4 ring-yellow-500/20",
    desc: "Jan 1–3",
  },
  {
    id: "independence",
    name: "Independence",
    emoji: "🇮🇳",
    icon: <Flag size={18} />,
    preview: "from-orange-500 via-white to-green-500",
    activeClass:
      "bg-orange-50 border-orange-300 text-orange-700 ring-4 ring-orange-500/20",
    desc: "Aug 13–15",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    emoji: "🤖",
    icon: <Cpu size={18} />,
    preview: "from-fuchsia-500 via-cyan-400 to-blue-500",
    activeClass:
      "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-700 ring-4 ring-fuchsia-500/20",
    desc: "Always on",
  },
  {
    id: "valentine",
    name: "Valentine's",
    emoji: "💝",
    icon: <Heart size={18} />,
    preview: "from-pink-400 via-rose-400 to-red-400",
    activeClass:
      "bg-pink-50 border-pink-300 text-pink-700 ring-4 ring-pink-500/20",
    desc: "Feb 10–14",
  },
  {
    id: "holi",
    name: "Holi Colors",
    emoji: "🎨",
    icon: <Palette size={18} />,
    preview: "from-pink-500 via-cyan-400 to-purple-500",
    activeClass:
      "bg-purple-50 border-purple-300 text-purple-700 ring-4 ring-purple-500/20",
    desc: "Mar 20–30",
  },
  {
    id: "halloween",
    name: "Halloween",
    emoji: "🎃",
    icon: <Ghost size={18} />,
    preview: "from-orange-500 via-red-500 to-purple-700",
    activeClass:
      "bg-orange-50 border-orange-300 text-orange-700 ring-4 ring-orange-500/20",
    desc: "Oct 28–31",
  },
] as const;

type ThemeId = (typeof themes)[number]["id"];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ThemeSwitcher({
  currentTheme,
}: {
  currentTheme: string;
}) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(
    currentTheme as ThemeId
  );
  const [isPending, startTransition] = useTransition();

  const hasChanged = selectedTheme !== currentTheme;

  const handleSave = () => {
    const previousTheme = currentTheme as ThemeId;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("theme", selectedTheme);

        const result = await updateStoreSettings(formData);

        if (result?.error) {
          toast.error(result.error);
          setSelectedTheme(previousTheme);
        } else {
          toast.success(`Theme updated! ${themes.find((t) => t.id === selectedTheme)?.emoji ?? ""}`);
        }
      } catch (error) {
        console.error("Theme update failed:", error);
        toast.error("Server se connect nahi hua. Dobara try karo.");
        setSelectedTheme(previousTheme);
      }
    });
  };

  const active = themes.find((t) => t.id === selectedTheme);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-slate-900">Store Theme</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Festival pe automatic theme ya manually choose karo. CSS animations
            hain — 0ms load impact.
          </p>
        </div>

        {/* Live preview pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 ml-4 shrink-0">
          <div
            className={`w-3 h-3 rounded-full bg-gradient-to-r ${active?.preview ?? "from-slate-300 to-slate-400"} shadow-sm`}
          />
          <span className="text-xs font-bold text-slate-600">
            {active?.emoji} {active?.name}
          </span>
        </div>
      </div>

      {/* Auto mode tip */}
      <div className="mt-4 mb-6 flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-sm text-violet-700 font-medium">
        <Wand2 size={15} className="shrink-0" />
        <span>
          <strong>Tip:</strong> "Auto Detect" select karo — festival ke hisaab se
          theme khud badlegi (Diwali, Christmas, Holi, etc.)
        </span>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {themes.map((t) => {
          const isSelected = selectedTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              disabled={isPending}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? `${t.activeClass} shadow-sm`
                  : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600"
                }
              `}
            >
              {/* Gradient preview bar */}
              <div
                className={`w-full h-1.5 rounded-full bg-gradient-to-r ${t.preview} opacity-80`}
              />

              {/* Icon */}
              <div
                className={`transition-transform duration-200 ${
                  isSelected && !isPending ? "scale-110" : ""
                }`}
              >
                {t.icon}
              </div>

              {/* Name */}
              <span className="font-bold text-xs text-center leading-tight">
                {t.emoji} {t.name}
              </span>

              {/* Festival date hint */}
              <span className="text-[10px] opacity-60 font-medium">{t.desc}</span>

              {/* Active dot */}
              {isSelected && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isPending || !hasChanged}
        className="
          w-full bg-slate-900 text-white font-bold py-4 rounded-xl 
          hover:bg-indigo-600 
          disabled:opacity-40 disabled:cursor-not-allowed 
          transition-all duration-200
          flex justify-center items-center gap-2 
          shadow-lg shadow-slate-900/10
          active:scale-[0.99]
        "
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Saving...</span>
          </>
        ) : hasChanged ? (
          <>
            <span>{active?.emoji}</span>
            <span>Apply "{active?.name}" Live</span>
          </>
        ) : (
          <span>Theme Saved ✓</span>
        )}
      </button>

      {/* Bottom note */}
      <p className="text-center text-xs text-slate-400 font-medium mt-4">
        Theme change hone ke baad sabhi visitors ko turant dikhega
      </p>
    </div>
  );
}