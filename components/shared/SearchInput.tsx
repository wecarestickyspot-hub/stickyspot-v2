"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // 🛡️ FIX 2: Added Error State
  const [error, setError] = useState(false);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // 🛡️ FIX 5: In-Memory Cache (Avoids refetching the exact same query)
  const cache = useRef<Record<string, any[]>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API call with AbortController
  useEffect(() => {
    // 🛡️ FIX 1: AbortController prevents Race Conditions
    const controller = new AbortController();
    
    const fetchResults = async () => {
      const trimmedQuery = query.trim();
      
      if (trimmedQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        setError(false);
        return;
      }

      // Check Cache first!
      if (cache.current[trimmedQuery]) {
        setResults(cache.current[trimmedQuery]);
        setIsOpen(true);
        setError(false);
        return;
      }

      setLoading(true);
      setError(false);
      
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        
        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        
        // Save to cache
        cache.current[trimmedQuery] = data;
        
        setResults(data);
        setIsOpen(true);
      } catch (err: any) {
        // Ignore AbortError, log/show other errors
        if (err.name !== "AbortError") {
          console.error("Search failed:", err);
          setError(true);
          setIsOpen(true); // Keep open to show the error message
        }
      } finally {
        setLoading(false);
      }
    };

    // 300ms delay debounce
    const timer = setTimeout(fetchResults, 300); 
    
    return () => {
      clearTimeout(timer);
      controller.abort(); // Cancel the previous request if user types again quickly
    };
  }, [query]);

  return (
    // 🛡️ FIX 6: Accessibility wrappers added
    <div 
      className="relative w-full max-w-md" 
      ref={searchRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="search-results"
      aria-haspopup="listbox"
    >
      {/* Search Input Box */}
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stickers (e.g. Anime)..."
          aria-label="Search products"
          className="w-full bg-slate-100/50 backdrop-blur-md border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400"
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />}
      </div>

      {/* 🔮 Live Glassmorphism Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div 
          id="search-results"
          role="listbox"
          className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.5rem] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2"
        >
          {/* 🛡️ FIX 2: Error State */}
          {error && !loading && (
            <div className="p-6 text-center text-rose-500 flex flex-col items-center justify-center gap-2">
               <AlertCircle size={24} />
               <p className="text-sm font-bold">Something went wrong.</p>
            </div>
          )}

          {/* 🛡️ FIX 3: Empty State */}
          {!error && !loading && results.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
               <Search size={28} className="text-slate-300 mb-1" strokeWidth={1.5} />
               <p className="text-sm font-bold text-slate-700">No results found</p>
               <p className="text-xs text-slate-400">We couldn't find anything matching "{query}"</p>
            </div>
          )}

          {/* Happy Path: Results Found */}
          {!error && results.length > 0 && (
            <>
              <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    role="option"
                    href={`/product/${product.slug}`}
                    onClick={() => { setIsOpen(false); setQuery(""); }}
                    className="flex items-center gap-4 p-3 hover:bg-indigo-50/80 rounded-xl transition-colors group"
                  >
                    <div className="relative w-12 h-12 bg-white rounded-lg border border-slate-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center p-1">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.title} fill className="object-contain p-1" />
                      ) : (
                        <span className="text-[8px] text-slate-400 font-bold uppercase">No Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{product.category}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-sm font-black text-slate-900">₹{product.price}</div>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* View All Button */}
              <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors w-full p-2"
                >
                  See all results for "{query}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}