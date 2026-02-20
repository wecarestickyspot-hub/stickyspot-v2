import Link from "next/link";
import { Ghost, ArrowLeft, Search, Sparkles, MailQuestion } from "lucide-react";
// ❌ REMOVED: import Navbar from "@/components/shared/Navbar"; -> Layout already has it!

// 🛡️ FIX 4: Strict SEO Consideration (Do not index 404 pages)
export const metadata = {
  title: "404 - Page Not Found | StickySpot",
  description: "Oops! We couldn't find the page you were looking for.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div 
      // ♿ FIX 3: Accessibility Roles
      role="alert"
      aria-labelledby="not-found-heading"
      className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative overflow-hidden"
    >
      {/* 🔮 Background Polish */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* ⚡ FIX 2: Optimized Blur (120px to 60px for better mobile GPU performance) */}
        <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-100/30 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 right-[-10%] w-[50vw] h-[50vw] bg-purple-100/20 rounded-full blur-[60px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 pt-20">
        
        {/* 404 Artistic Text */}
        <div className="relative mb-8">
            {/* The giant 404 number */}
            <h1 className="text-[12rem] md:text-[18rem] font-black text-slate-100 leading-none select-none tracking-tighter">
                404
            </h1>
            
            {/* The Floating Ghost */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
                    {/* 🎯 FIX 6: Slower, premium bounce animation */}
                    <Ghost 
                        size={80} 
                        className="text-indigo-600 animate-bounce relative z-10" 
                        strokeWidth={1.5} 
                        style={{ animationDuration: '3s' }} 
                    />
                </div>
            </div>
        </div>
        
        <div className="max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* ♿ Linked to aria-labelledby */}
            <h2 id="not-found-heading" className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Wandered into the void?
            </h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">
                The sticker you're looking for might have been peeled off, moved, or never existed in this dimension.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                    href="/shop" 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 group"
                >
                    <Search size={18} strokeWidth={2.5} /> Browse Shop
                </Link>
                
                <Link 
                    href="/" 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                    <ArrowLeft size={18} /> Go Home
                </Link>
            </div>
            
            {/* 🧠 FIX 5: UX Support Link */}
            <div className="mt-8">
                <Link 
                    href="mailto:support@stickyspot.in?subject=Broken%20Link%20Report" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <MailQuestion size={16} /> Report a broken link
                </Link>
            </div>

            <div className="mt-16 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                <Sparkles size={12} /> StickySpot Pro 2026
            </div>
        </div>

      </div>
    </div>
  );
}