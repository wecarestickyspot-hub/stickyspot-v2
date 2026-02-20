import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center max-w-md w-full animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
             <AlertCircle size={40} className="text-rose-500" strokeWidth={1.5} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
           <p className="text-slate-500 font-medium mb-8">The sticker you are trying to edit doesn't exist or was recently permanently deleted.</p>
           <Link href="/admin/products" className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/10 active:scale-95 text-center">
             Back to Inventory
           </Link>
        </div>
      </div>
    </div>
  );
}