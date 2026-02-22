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

  const allCategories = ["All", ...categories.filter(c => c !== "All")];
  const safeCategory = allCategories.includes(rawCategory) ? rawCategory : "All";
  const hasActiveFilters = safeCategory !== "All" || currentSort !== "newest";

  const updateFilter = (key: string, value: string) => {
    if (key === "category" && safeCategory === value) return;
    if (key === "sort" && currentSort === value) return;

    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "All" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.replace("/shop", { scroll: false });
  };

  return (
    // 🚀 FIX: Removed the giant vertical box on mobile. Kept premium box for desktop.
    <div className="w-full lg:bg-white/60 lg:backdrop-blur-xl lg:border lg:border-white/80 lg:rounded-[2rem] lg:p-6 lg:shadow-sm">
      
      {/* Header & Clear Filters Button (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-indigo-600" />
          <h2 className="text-lg font-black text-slate-900">Filters</h2>
        </div>
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
      <div className="mb-4 lg:mb-8">
        <h3 className="hidden lg:flex text-xs font-black text-slate-400 uppercase tracking-widest mb-4 items-center gap-1.5">
          <Tag size={14} /> Categories
        </h3>
        
        {/* 🚀 FIX: Horizontal Scrollable Pills for Mobile, Vertical list for Desktop */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => {
            const isActive = safeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                aria-pressed={isActive}
                // 🚀 FIX: Pill design for mobile (rounded-full, horizontal)
                className={`whitespace-nowrap flex-shrink-0 text-center lg:text-left px-5 lg:px-4 py-2.5 rounded-full lg:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-slate-900 lg:bg-indigo-50 text-white lg:text-indigo-700 lg:border lg:border-indigo-200 shadow-md lg:shadow-sm" 
                    : "bg-white lg:bg-transparent text-slate-600 border border-slate-200 lg:border-transparent hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ⬇️ Sort Options */}
      <div className="hidden lg:block">
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
                aria-pressed={isActive} 
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