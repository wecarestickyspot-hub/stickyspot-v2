"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // 🚀 The Magic Hook

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Current URL parameters ko copy karke usme naya page number daalna
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    // ⚡ transition ke andar router.push karne se page freeze nahi hoga!
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    });
  };

  if (totalPages <= 1) return null; // Agar 1 hi page hai toh hide kar do

  return (
    <div className="flex items-center justify-center gap-4 mt-12 mb-8 font-sans">
      {/* ⬅️ PREV BUTTON */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* 🔢 PAGE NUMBERS INDICATOR */}
      <div className="flex items-center justify-center min-w-[80px] bg-slate-900 text-white font-black text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-slate-900/10">
        {isPending ? (
          <Loader2 size={18} className="animate-spin text-indigo-400" />
        ) : (
          <span>{currentPage} <span className="text-slate-400 font-medium">/</span> {totalPages}</span>
        )}
      </div>

      {/* ➡️ NEXT BUTTON */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}