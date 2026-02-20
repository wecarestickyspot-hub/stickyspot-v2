"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "@/lib/actions";
import { Sparkles, Snowflake, Monitor, Loader2, Cpu, Heart, Palette, Ghost } from "lucide-react";
import toast from "react-hot-toast";

export default function ThemeSwitcher({ currentTheme }: { currentTheme: string }) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    // Save current theme to revert if network fails
    const previousTheme = currentTheme;
    
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("theme", selectedTheme);

        // 🛡️ Server action ALREADY handles SUPER_ADMIN auth & Zod string validation
        const result = await updateStoreSettings(formData);
        
        if (result?.error) {
          toast.error(result.error);
          setSelectedTheme(previousTheme); // Revert on specific server error
        } else {
          toast.success("Theme updated globally! 🌍");
        }
      } catch (error) {
        console.error("Theme update failed:", error);
        toast.error("Failed to connect to the server. Please try again.");
        setSelectedTheme(previousTheme); // Revert on network crash
      }
    });
  };

  const themes = [
    { 
      id: "default", 
      name: "Premium Light", 
      icon: <Monitor size={20} />, 
      activeClass: "bg-indigo-50 border-indigo-200 text-indigo-600 ring-4 ring-indigo-500/20" 
    },
    { 
      id: "diwali", 
      name: "Diwali Gold", 
      icon: <Sparkles size={20} />, 
      activeClass: "bg-amber-50 border-amber-200 text-amber-600 ring-4 ring-amber-500/20" 
    },
    { 
      id: "christmas", 
      name: "Christmas Snow", 
      icon: <Snowflake size={20} />, 
      activeClass: "bg-rose-50 border-rose-200 text-rose-600 ring-4 ring-rose-500/20" 
    },
    { 
      id: "cyberpunk", 
      name: "Cyberpunk", 
      icon: <Cpu size={20} />, 
      activeClass: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600 ring-4 ring-fuchsia-500/20" 
    },
    { 
      id: "valentine", 
      name: "Valentine's", 
      icon: <Heart size={20} />, 
      activeClass: "bg-pink-50 border-pink-200 text-pink-600 ring-4 ring-pink-500/20" 
    },
    { 
      id: "holi", 
      name: "Holi Colors", 
      icon: <Palette size={20} />, 
      activeClass: "bg-purple-50 border-purple-200 text-purple-600 ring-4 ring-purple-500/20" 
    },
    { 
      id: "halloween", 
      name: "Spooky Sale", 
      icon: <Ghost size={20} />, 
      activeClass: "bg-orange-50 border-orange-200 text-orange-600 ring-4 ring-orange-500/20" 
    },
  ];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-4xl">
      <h2 className="text-xl font-black text-slate-900 mb-2">Store Theme</h2>
      <p className="text-slate-500 text-sm font-medium mb-8">Change the global look and feel of your website instantly. Animations run on CSS for 0ms load impact.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTheme(t.id)}
            disabled={isPending} // Disable switching while saving
            className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedTheme === t.id 
                ? `${t.activeClass} scale-100 shadow-sm` 
                : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            <div className={`mb-3 transition-transform duration-300 ${selectedTheme === t.id && !isPending ? 'scale-110 animate-pulse' : ''}`}>
               {t.icon}
            </div>
            <span className="font-bold text-sm text-center">{t.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isPending || selectedTheme === currentTheme}
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : "Save & Apply Live"}
      </button>
    </div>
  );
}