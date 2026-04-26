"use client";

import { deleteCoupon, toggleCouponStatus } from "@/lib/actions";
import { Trash2, Power, Calendar, TicketPercent, Copy, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useTransition } from "react";

export default function CouponTable({ coupons }: { coupons: any[] }) {
  // 🛡️ Pending state to prevent Spam Clicks
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 📋 Copy to Clipboard Logic with Fallback
  const handleCopy = (code: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code);
      toast.success(`Promo Code ${code} Copied! 📋`);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(`Promo Code ${code} Copied! 📋`);
      } catch (err) {
        toast.error("Failed to copy code.");
      }
      document.body.removeChild(textArea);
    }
  };

  // 🗑️ Safe Delete Logic
  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}? This action cannot be undone.`)) {
      setProcessingId(id);
      startTransition(async () => {
        try {
          const result = await deleteCoupon(id);

          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Coupon deleted successfully!");
          }
        } catch (error) {
          toast.error("Failed to delete coupon.");
        } finally {
          setProcessingId(null);
        }
      });
    }
  };

  // 🔄 Safe Toggle Logic
  const handleToggle = (id: string, currentStatus: boolean) => {
    setProcessingId(id);

    startTransition(async () => {
      try {
        const result = await toggleCouponStatus(id);

        if (!result.success) {
          toast.error(result.error || "Failed to update status");
        } else {
          toast.success("Coupon status updated! 🔄");
        }
      } catch (error) {
        toast.error("Something went wrong.");
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-black text-slate-900">Active Promos</h3>
        <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-md">{coupons.length} Total</span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Code Details</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Usage</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((coupon) => {
              // 🧠 Smart Status Logic
              const isExpired = new Date(coupon.endDate) < new Date();
              const isExhausted = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
              const isRowProcessing = isPending && processingId === coupon.id;

              return (
                <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* 1. Code Details (UPGRADED) */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100/50 w-fit px-3 py-1.5 rounded-lg group/copy cursor-pointer" onClick={() => handleCopy(coupon.code)}>
                        <TicketPercent size={14} className="text-indigo-500" />
                        <span className="font-mono font-bold text-indigo-700 uppercase tracking-wider text-sm">{coupon.code}</span>
                        <Copy size={12} className="text-indigo-400 opacity-0 group-hover/copy:opacity-100 transition-opacity ml-1" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {coupon.isPublic ? (
                           <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                             <Eye size={10} /> Public (In Cart)
                           </span>
                        ) : (
                           <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                             <EyeOff size={10} /> Secret
                           </span>
                        )}
                      </div>

                      {coupon.description && (
                        <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]" title={coupon.description}>
                          "{coupon.description}"
                        </p>
                      )}
                    </div>
                  </td>

                  {/* 2. Value */}
                  <td className="px-6 py-5 align-top pt-7">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                      </span>
                      {coupon.minOrderValue && (
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Min: ₹{coupon.minOrderValue}</span>
                      )}
                    </div>
                  </td>

                  {/* 3. Usage & Expiry */}
                  <td className="px-6 py-5 align-top pt-7">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${isExhausted ? "text-amber-500" : "text-slate-600"}`}>
                        {coupon.usedCount} <span className="text-slate-400 font-medium">/ {coupon.usageLimit ? coupon.usageLimit : "∞"} uses</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        <Calendar size={12} />
                        <span className={isExpired ? "text-rose-500" : ""}>
                          {new Date(coupon.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                      </span>
                    </div>
                  </td>

                  {/* 4. Smart Status Badge */}
                  <td className="px-6 py-5 align-top pt-7">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${isExhausted
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : coupon.isActive && !isExpired
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : isExpired
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isExhausted ? "bg-amber-500" : coupon.isActive && !isExpired ? "bg-emerald-500 animate-pulse" : isExpired ? "bg-rose-500" : "bg-slate-400"}`}></span>
                      {isExhausted ? "EXHAUSTED" : isExpired ? "EXPIRED" : coupon.isActive ? "ACTIVE" : "PAUSED"}
                    </div>
                  </td>

                  {/* 5. Actions */}
                  <td className="px-6 py-5 text-right align-top pt-6">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">

                      {/* Secure Toggle Action */}
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.isActive)}
                        disabled={processingId === coupon.id}
                        className={`p-2 rounded-full border transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${coupon.isActive
                            ? "bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50"
                            : "bg-white border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50"
                          }`}
                        title={coupon.isActive ? "Pause Coupon" : "Activate Coupon"}
                      >
                        {isRowProcessing ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} strokeWidth={2.5} />}
                      </button>

                      {/* Secure Delete Action */}
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        disabled={isPending}
                        className="p-2 rounded-full border bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Coupon"
                      >
                        {isRowProcessing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5} />}
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3">
                      <TicketPercent size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold">No coupons generated yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Use the form on the left to create your first promo code.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}