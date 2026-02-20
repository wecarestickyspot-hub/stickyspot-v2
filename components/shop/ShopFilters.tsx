"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowDownUp, Tag, XCircle } from "lucide-react";

interface ShopFiltersProps {
  categories: string[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCategory = searchParams.get("category") || "All";
  const currentSort = searchParams.get("sort") || "newest";

  // 🛡️ FIX 1: Production Safety (Missing "All" & URL Hacking Guard)
  // Ensure "All" is always present and deduplicate if passed by mistake
  const allCategories = ["All", ...categories.filter(c => c !== "All")];
  
  // If user types ?category=Hacked in URL, fallback safely to "All"
  const safeCategory = allCategories.includes(rawCategory) ? rawCategory : "All";

  const hasActiveFilters = safeCategory !== "All" || currentSort !== "newest";

  // Filter Update Logic
  const updateFilter = (key: string, value: string) => {
    // ⚡ FIX 2: Prevent Double Click Spam & Unnecessary renders
    if (key === "category" && safeCategory === value) return;
    if (key === "sort" && currentSort === value) return;

    const params = new URLSearchParams(searchParams.toString());
    
    // Agar "All" ya "newest" select kiya hai toh URL se parameter hata do (Clean URL)
    if (value === "All" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // ⚡ FIX 3: Use router.replace() instead of push() to avoid polluting browser history
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.replace("/shop", { scroll: false });
  };

  return (
    // Note: Kept sticky behavior, but ensure parent container handles mobile hiding (e.g., hidden lg:block)
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-sm sticky top-32">
      
      {/* Header & Clear Filters Button */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-indigo-600" />
          <h2 className="text-lg font-black text-slate-900">Filters</h2>
        </div>

        {/* 💰 UX FIX: Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            aria-label="Clear all filters"
            className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <XCircle size={14} /> Clear
          </button>
        )}
      </div>

      {/* 🏷️ Categories Options */}
      <div className="mb-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Tag size={14} /> Categories
        </h3>
        {/* ♿ Accessibility: grouped as a radiogroup visually */}
        <div className="flex flex-col gap-2" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => {
            const isActive = safeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                aria-pressed={isActive} // ♿ Accessibility Upgrade
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm" 
                    : "bg-transparent text-slate-600 border border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⬇️ Sort Options */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <ArrowDownUp size={14} /> Sort By
        </h3>
        <div className="flex flex-col gap-2" role="group" aria-label="Sort products">
          {[
            { label: "Newest First", value: "newest" },
            { label: "Price: Low to High", value: "price_asc" },
            { label: "Price: High to Low", value: "price_desc" },
          ].map((option) => {
            const isActive = currentSort === option.value;
            return (
              <button
                key={option.value}
                onClick={() => updateFilter("sort", option.value)}
                aria-pressed={isActive} // ♿ Accessibility Upgrade
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : "bg-transparent text-slate-600 border border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}