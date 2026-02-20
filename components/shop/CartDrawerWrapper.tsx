"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// 🛡️ Loading Fallback UI
// Jab tak CartDrawer ki JavaScript file load hogi, user ko ek smooth skeleton/spinner dikhega.
const CartDrawer = dynamic(() => import("@/components/shop/CartDrawer"), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" />
      <div className="relative w-full max-w-md h-full bg-white/95 backdrop-blur-3xl shadow-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
           <Loader2 size={32} className="animate-spin text-indigo-500" />
           <p className="text-sm font-bold tracking-widest uppercase">Loading Cart...</p>
        </div>
      </div>
    </div>
  )
});

export default function CartDrawerWrapper() {
  return <CartDrawer />;
}