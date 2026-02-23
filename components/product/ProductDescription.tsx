"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Split description into readable bullet lines
  const paragraphs = description.split("\n").filter(line => line.trim() !== "");

  return (
    <div className="mb-8 border border-slate-200 rounded-[1.5rem] bg-white overflow-hidden shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // 💎 BONUS: Added subtle hover background for premium feel
        className="w-full flex flex-col p-4 sm:p-5 text-left focus:outline-none group hover:bg-slate-50/50 transition-colors rounded-[1.5rem]"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
              What Makes It Premium
            </span>
          </div>
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {/* 🎯 FIX 2: Exact alignment with ml-[28px] (icon width based) */}
        {!isOpen && (
          <p className="text-[11px] sm:text-xs text-slate-400 mt-2 line-clamp-1 font-medium ml-[32px] animate-in fade-in duration-500">
            {description.replace(/<[^>]+>/g, '')}
          </p>
        )}
      </button>

      {/* 🚀 FIX 1 & 3: Premium Smooth Easing & Clean Animation */}
      <div
        className="overflow-hidden transition-all"
        style={{
          maxHeight: isOpen ? "600px" : "0px",
          opacity: isOpen ? 1 : 0,
          // Apple-style smooth expansion
          transition: "max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease"
        }}
      >
        {/* Inner content wrapper for padding safety */}
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mx-4 mt-1">
          <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 space-y-3 pt-4 font-medium leading-relaxed">
            {paragraphs.map((para, i) => (
              <p key={i} className="flex gap-3">
                {/* Visual Bullet */}
                <span className="text-indigo-300 mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>{para}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}