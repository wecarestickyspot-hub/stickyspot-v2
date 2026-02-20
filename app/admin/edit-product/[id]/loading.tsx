import { Loader2 } from "lucide-react";

export default function LoadingEditProduct() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20">
        <Loader2 className="text-indigo-500 animate-spin mb-4" size={48} strokeWidth={2} />
        <h2 className="text-xl font-black text-slate-900 animate-pulse tracking-tight">Fetching Product Details...</h2>
        <p className="text-slate-500 font-medium text-sm mt-2">Connecting to secure database</p>
      </div>
    </div>
  );
}