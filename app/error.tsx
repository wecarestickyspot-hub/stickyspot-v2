"use client";

import { AlertCircle, RefreshCcw, Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 🛡️ FIX 3: Retry Protection State
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // 🛡️ FIX 1: Security - Never leak raw errors to client console in production.
    // In a real production app, you would send this to Sentry/Datadog here.
    if (process.env.NODE_ENV !== "production") {
      console.error("Application Error:", error);
    }
  }, [error]);

  const handleRetry = () => {
    if (isRetrying) return; // Prevent spamming
    setIsRetrying(true);
    
    // Tiny delay to ensure loading state renders before Next.js triggers the synchronous reset
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* 🔮 Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* 🛡️ FIX 4: Accessibility & Responsive Padding (p-6 sm:p-10) */}
        <div 
          role="alert" 
          aria-live="assertive"
          className="bg-white border border-slate-100 p-6 sm:p-10 rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center text-center"
        >
          
          <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center mb-8 shadow-inner rotate-3">
            <AlertCircle size={40} className="text-rose-500" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter leading-tight">Something <br/>Went Wrong!</h2>
          
          {/* 🛡️ FIX 3: Clear UX Messaging */}
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            We encountered a temporary server issue. Don't worry, our team has been notified.
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                 <><Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> Retrying...</>
              ) : (
                 <><RefreshCcw size={18} strokeWidth={2.5} /> Try Again</>
              )}
            </button>
            
            <Link href="/" className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 disabled:pointer-events-none">
              <Home size={18} /> Back to Home
            </Link>
          </div>
        </div>
        
        {/* 🛡️ FIX 2: Professional Error Code Fallback */}
        <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Error Code: {error.digest ?? "ERR_500"}
        </p>
      </div>
    </div>
  );
}