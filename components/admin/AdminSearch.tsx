"use client";

import { Search, X, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function AdminSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // URL se initial value lena (Initial load ke liye window ki jagah URLSearchParams safe hai)
  const [value, setValue] = useState("");

  // Initial value set karne ke liye
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue(params.get("query") || "");
  }, []);

  // 🚀 FIX 1: Stable Effect (No more re-render loops)
  useEffect(() => {
    // Agar value empty hai toh debounce ki zaroorat nahi (ya clear function handle kar lega)
    if (value === "") return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      
      params.set("query", value);
      params.set("page", "1");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, router, pathname]);

  // 🚀 FIX 2: Instant Reset (Better UX)
  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(window.location.search);
    params.delete("query");
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="relative flex-1 sm:w-80 group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Search size={18} strokeWidth={2.5} />
        )}
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by title or category..."
        // 🚀 FIX 3: Premium UI Upgrade (bg-slate-50 -> bg-white)
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
      />

      {value && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
        >
          <X size={16} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}