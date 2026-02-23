"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Tag, XCircle, ArrowDownUp } from "lucide-react";

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
    <div className="w-full relative z-40 bg-white/90 backdrop-blur-xl border border-slate-200 md:border-white/80 rounded-3xl md:rounded-[2rem] p-4 md:p-6 shadow-sm mb-6 md:mb-0 transition-all duration-300">
      
      {/* --- 📱 MOBILE & PC HEADER --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        
        {/* Title & Active Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm md:text-lg">
            <Filter size={18} className="text-indigo-600" />
            <span>Filters</span>
          </div>
          {hasActiveFilters && (
            <div className="hidden sm:flex text-[10px] font-bold text-indigo-600 items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-md animate-in fade-in zoom-in duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Active
            </div>
          )}
        </div>

        {/* 🚀 MOBILE ONLY: Sort Dropdown & Clear Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* 📱 DROPDOWN - Strictly hidden on medium/large screens (md:hidden) */}
          <div className="flex md:hidden items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              aria-label="Clear all filters"
              className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors"
            >
              <XCircle size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Clear</span>
            </button>
          )}

        </div>
      </div>

      {/* --- 🏷️ CATEGORIES OPTIONS --- */}
      <div>
        <h3 className="hidden md:flex text-xs font-black text-slate-400 uppercase tracking-widest mb-4 items-center gap-1.5">
          <Tag size={14} /> Categories
        </h3>
        
        <div className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => {
            const isActive = safeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat)}
                aria-pressed={isActive}
                className={`snap-start relative z-50 whitespace-nowrap flex-shrink-0 text-center md:text-left px-4 py-2 rounded-full md:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none border 
                  ${isActive 
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30" 
                    : "bg-white md:bg-transparent text-slate-600 border-slate-200 md:border-transparent hover:bg-slate-50 hover:border-slate-300 shadow-sm md:shadow-none"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 💻 DESKTOP ONLY: SORT BUTTONS --- */}
      {/* Strictly hidden on mobile, visible only on medium/large screens (hidden md:block) */}
      <div className="hidden md:block mt-8">
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
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
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