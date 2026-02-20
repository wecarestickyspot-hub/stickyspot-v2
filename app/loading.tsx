import { Sparkles } from "lucide-react";

export default function Loading() {
  // 🛡️ FIX 4: Brand name scaling (White-label ready)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "StickySpot";

  return (
    <div 
      // ♿ FIX 5: Accessibility
      role="status" 
      aria-live="polite"
      // 🛡️ FIX 1: Safe z-index (z-50 instead of z-[9999])
      className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden font-sans z-50"
    >
      {/* Screen Reader Only Text */}
      <span className="sr-only">Loading {appName} experience...</span>

      {/* 🔮 Background Glass Orbs (Smooth Breathing Effect) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* ⚡ FIX 2: Optimized Blur for GPU Performance (60px instead of 100px) */}
        <div className="absolute w-[40vw] h-[40vw] bg-indigo-200/40 rounded-full blur-[60px] animate-pulse transform-gpu" style={{ animationDuration: '3s' }} />
        <div className="absolute w-[30vw] h-[30vw] bg-purple-200/30 rounded-full blur-[60px] animate-pulse delay-700 transform-gpu" style={{ animationDuration: '4s' }} />
      </div>

      {/* 🧊 Premium Glass Loading Card */}
      <div className="relative z-10 bg-white/60 backdrop-blur-2xl border border-white/80 px-12 py-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center animate-in zoom-in-95 duration-500">
        
        {/* Custom Animated Loader */}
        <div className="relative mb-6">
          {/* Track Ring */}
          <div className="absolute inset-0 border-[3px] border-indigo-50 rounded-full"></div>
          
          {/* Spinning Ring */}
          <div className="absolute inset-0 border-[3px] border-indigo-600 rounded-full border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
          
          {/* Inner Logo Icon */}
          <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-sm m-2 z-10 relative">
            {/* ⚡ FIX 3: Removed animate-pulse here to save battery/CPU rendering */}
            <Sparkles className="text-indigo-600" size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Brand Name */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          {appName}<span className="text-indigo-600">.</span>
        </h2>
        
        {/* Bouncing Dots Loading Text */}
        <div className="flex items-center gap-1.5 mt-1">
          {/* 🎯 FIX 6: Clearer UX Messaging */}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">
            Fetching your stickers
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>

      </div>
    </div>
  );
}