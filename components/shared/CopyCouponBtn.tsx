"use client";

import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CopyCouponBtn({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  // 🛡️ FIX 2: Elite-level memory leak protection
  // Automatically clears the timeout if the component unmounts before 2 seconds
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 🛡️ FIX 1: Safe Clipboard API handling
    try {
      // Check if clipboard API exists (prevents crashes on older browsers or HTTP)
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Coupon Copied! ✂️");
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy coupon. Please copy manually!");
    }
  };

  return (
    <button 
      type="button" // 🛡️ FIX 3: Prevents accidental parent form submission
      aria-label={`Copy coupon code ${code}`} // 🛡️ FIX 3: Accessibility for screen readers
      onClick={handleCopy}
      className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg transition-all flex items-center gap-2 group active:scale-90"
    >
      <span className="text-white font-black text-[10px] tracking-wider">{code}</span>
      {copied ? (
        <Check size={10} className="text-emerald-400 animate-in zoom-in" strokeWidth={3} />
      ) : (
        <Copy size={10} className="text-slate-300 group-hover:rotate-12 transition-transform" />
      )}
    </button>
  );
}