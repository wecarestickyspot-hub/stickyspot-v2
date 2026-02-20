"use client";

import { useCartStore } from "@/store/useCartStore";
import { Truck, Sparkles, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ShopShippingBar() {
  const { items, freeShippingThreshold, getCartTotal, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // 🛡️ FIX 5: Don't show this bar on pages where it doesn't make sense (Checkout, Admin, Legal)
  const hiddenPaths = ["/checkout", "/admin", "/legal", "/sign-in", "/sign-up"];
  if (hiddenPaths.some(path => pathname?.startsWith(path))) return null;

  const { subtotal } = getCartTotal();
  
  // 🛡️ FIX 1: Division by Zero Risk Prevention
  // Never allow the threshold to be 0 for math calculations.
  const THRESHOLD = freeShippingThreshold > 0 ? freeShippingThreshold : 499; 
  
  const missing = Math.max(0, THRESHOLD - subtotal);
  const progress = Math.min((subtotal / THRESHOLD) * 100, 100);

  // Conditions to hide bar
  if (items.length === 0) return null; 

  // 🚀 CONVERSION UPGRADE: The "Unlocked" State
  if (progress >= 100) return (
    <div className="bg-emerald-500 text-white border-b border-emerald-600 sticky top-20 z-40 animate-in fade-in slide-in-from-top duration-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
            
            {/* 🚀 FIX 2 & 3: Unlock Animation & Micro Confetti Vibe */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest animate-[bounceIn_0.5s_ease-out]">
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                Congrats! You've unlocked FREE EXPRESS SHIPPING
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
            </div>

            {/* 🚀 FIX 4: "Continue Shopping" or "View Cart" CTA */}
            <div className="flex items-center gap-4 text-xs font-bold">
               <button 
                 onClick={() => setIsOpen(true)} 
                 className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors backdrop-blur-sm border border-white/30"
               >
                 <ShoppingBag size={14} /> View Cart
               </button>
            </div>
        </div>
    </div>
  );

  // 🚀 CONVERSION UPGRADE: The "Progress" State
  return (
    // 🛡️ FIX 3: Replaced fragile 'top-[64px] lg:top-[80px]' with safe 'top-20' (assuming standard navbar)
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-20 z-40 animate-in fade-in slide-in-from-top duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-600">
           <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 animate-bounce">
              <Truck size={14} className="text-white" strokeWidth={2.5}/>
           </div>
           <p className="leading-tight">
              Add <span className="text-indigo-600 font-black text-base">₹{missing.toFixed(0)}</span> more to get <span className="text-slate-900 font-black underline decoration-indigo-300 underline-offset-4">FREE SHIPPING</span>
           </p>
        </div>
        
        {/* Progress Container & Upsell Logic */}
        <div className="w-full sm:w-auto flex items-center gap-4 flex-1 justify-end">
            
            {/* 🚀 FIX 1: Dynamic Upsell Suggestion (Only show on Desktop to save space) */}
            {missing > 0 && missing <= 200 && (
               <Link href="/shop?category=Bundle" className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-pink-500 hover:text-pink-600 transition-colors animate-pulse">
                  👉 Grab a bundle to unlock!
               </Link>
            )}

            <div className="w-full sm:w-64 flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Glossy effect on progress bar */}
                        <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-[-20deg] animate-pulse" />
                    </div>
                </div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md min-w-[45px] text-center border border-indigo-100">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}