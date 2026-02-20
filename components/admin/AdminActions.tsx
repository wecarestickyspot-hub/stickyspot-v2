"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct, updateOrderStatus } from "@/actions/admin";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

// --- 1. DELETE BUTTON COMPONENT ---
export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("🚨 Are you absolutely sure? This cannot be undone.")) {
      startTransition(async () => {
        try {
          const res = await deleteProduct(id);

          // Hum check karenge ki success false hai kya?
          if (!res.success) {
            // Agar fail hua, toh 'message' dikhayenge ('error' nahi)
            toast.error(res.message);
          } else {
            toast.success("Sticker deleted successfully! 🗑️");
          }
        } catch (error) {
          toast.error("Failed to delete product.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete Product"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}

// --- 2. ORDER STATUS DROPDOWN ---
export function OrderStatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  // 🧠 FIX: Local state for immediate UI reflection (Optimistic UI)
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLocalStatus(newStatus); // Update UI instantly

    startTransition(async () => {
      try {
        const res = await updateOrderStatus(id, newStatus);

        // Hum check karenge ki success FALSE hai kya
        if (!res.success) {
          setLocalStatus(currentStatus); // Revert UI
          toast.error(res.message);      // 👈 'error' ki jagah 'message' aayega
        } else {
          toast.success(`Order marked as ${newStatus} ✅`);
        }
      } catch (error) {
        setLocalStatus(currentStatus); // Revert UI
        toast.error("Server error updating status.");
      }
    });
  };

  // Dynamic Color Mapping based on ACTIVE state
  const colorClass =
    localStatus === 'PAID' ? 'text-emerald-400' :
      localStatus === 'SHIPPED' ? 'text-indigo-400' :
        localStatus === 'DELIVERED' ? 'text-purple-400' :
          localStatus === 'CANCELLED' ? 'text-rose-400' : 'text-amber-400';

  return (
    <div className="relative flex items-center gap-2">
      <select
        value={localStatus} // 🧠 Controlled via state, not defaultValue
        onChange={handleStatusChange}
        disabled={isPending}
        className={`appearance-none bg-slate-900 border border-slate-700 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors ${colorClass}`}
      >
        <option value="PENDING">🟡 PENDING</option>
        <option value="PAID">🟢 PAID</option>
        <option value="SHIPPED">🚚 SHIPPED</option>
        <option value="DELIVERED">🎉 DELIVERED</option>
        <option value="CANCELLED">❌ CANCELLED</option>
      </select>

      {isPending && (
        <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />
      )}
    </div>
  );
}