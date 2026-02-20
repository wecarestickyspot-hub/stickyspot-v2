"use client";

import { useState } from "react";
import { PackageSearch, FileText, CheckCircle2, Truck, Loader2, AlertCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";

interface AdminShippingProps {
  orderId: string;
  orderAddress: string;
  orderStatus: string; // 🛡️ NEW: Needed to prevent duplicate generation
}

export default function AdminShippingCard({ orderId, orderAddress, orderStatus }: AdminShippingProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [labelData, setLabelData] = useState<{ awb: string; courier: string; labelUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAlreadyShipped = orderStatus === "SHIPPED" || orderStatus === "DELIVERED";

  const handleGenerateLabel = async () => {
    // 🛡️ FRONTEND GUARD 1: Prevent duplicate generation
    if (isAlreadyShipped && !labelData) {
        toast.error("Order is already marked as shipped!");
        return;
    }

    // 🛡️ FRONTEND GUARD 2: Financial action confirmation
    const confirmed = window.confirm("Generate a shipping label? This will push the order to Shiprocket and may incur charges.");
    if (!confirmed) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shiprocket/generate-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }) 
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLabelData({
          awb: data.awb,
          courier: data.courier,
          labelUrl: data.label_url
        });
        toast.success("Shipping label generated successfully! 📦");
      } else {
        const errorMsg = data.message || "Failed to generate label from Shiprocket.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      // 🛡️ FRONTEND GUARD 3: Secure console logging
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to generate label", err);
      }
      const networkError = "Network error. Could not reach logistics API.";
      setError(networkError);
      toast.error(networkError);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]">
      
      {/* HEADER */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/50 shadow-sm">
          <Truck className="text-emerald-600" size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Shipping & Logistics</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Manage delivery labels and tracking</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {!labelData ? (
          <div className="bg-slate-50 rounded-[1.5rem] border border-slate-200 p-8 text-center shadow-sm">
            <PackageSearch className="text-slate-400 w-12 h-12 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-slate-900 font-black text-xl mb-2">No Label Generated Yet</h3>
            <p className="text-slate-500 font-medium text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Generate a shipping label to send order details to your logistics partner and assign an AWB tracking number.
            </p>
            
            {error && (
              <div className="mb-6 flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold justify-center max-w-md mx-auto">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-left">{error}</span>
              </div>
            )}

            <button 
              onClick={handleGenerateLabel}
              disabled={isGenerating || isAlreadyShipped}
              className="bg-slate-900 text-white font-bold px-8 py-4 rounded-full hover:bg-indigo-600 transition-all flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-slate-900/10"
            >
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} strokeWidth={2.5} />} 
              {isGenerating ? "Connecting to Shiprocket..." : isAlreadyShipped ? "Already Shipped" : "Generate Shipping Label"}
            </button>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100 p-6 md:p-8 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                  <div>
                      <h3 className="text-emerald-900 font-black text-xl tracking-tight">Label Ready to Print</h3>
                      <p className="text-emerald-700/80 font-bold text-xs uppercase tracking-widest mt-1">Generated for #{orderId.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <span className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-200 shadow-sm">
                  {labelData.courier || "Shiprocket"}
                </span>
            </div>
            
            <div className="bg-white rounded-[1.5rem] p-6 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shadow-sm gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Truck size={14}/> Tracking AWB</p>
                <p className="text-slate-900 font-mono font-black text-2xl tracking-tight">{labelData.awb}</p>
              </div>
              <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 sm:justify-end"><MapPin size={14}/> Destination</p>
                  <p className="text-slate-700 font-bold text-sm max-w-[250px] leading-relaxed truncate">{orderAddress}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                   if(labelData.labelUrl) {
                       // 🛡️ FRONTEND GUARD 4: Secure window.open to prevent reverse tabnabbing
                       window.open(labelData.labelUrl, '_blank', 'noopener,noreferrer');
                   } else {
                       toast.error("Label PDF generation endpoint needed from Shiprocket!");
                   }
                }}
                className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <FileText size={20} strokeWidth={2.5} /> Download PDF Label
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}