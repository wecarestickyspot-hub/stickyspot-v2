"use client";

import { useState } from "react";
import { Truck, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // 🔥 Premium UX Toast

export default function PushToShiprocket({ orderId, isShipped }: { orderId: string, isShipped?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // 💡 PRO FEATURE: Already Shipped Check
  if (isShipped || success) {
    return (
      <button disabled className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-emerald-200 cursor-not-allowed">
        <CheckCircle size={18} /> Already Shipped
      </button>
    );
  }

  const handlePush = async () => {
    // ⚠️ CRITICAL BUG FIX: Double Click Protection
    if (loading || success) return;

    try {
      setLoading(true);
      
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      // ⚡ Better Error Handling
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Shiprocket Failed");
      }

      setSuccess(true);
      toast.success("Order pushed to Shiprocket 🚀");

      // Page refresh for new status
      router.refresh(); 

    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePush}
      disabled={loading}
      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
      {/* 🎯 UX UPGRADE */}
      {loading ? "Creating Shipment..." : "Ship via Shiprocket"}
    </button>
  );
}