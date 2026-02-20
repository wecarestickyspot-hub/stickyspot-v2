"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "@/lib/actions";
import { Truck, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ShippingManager({ 
  currentThreshold, 
  currentCharge 
}: { 
  currentThreshold: number; 
  currentCharge: number; 
}) {
  // 🛡️ FIX 5: Better UX state handling for empty inputs
  const [threshold, setThreshold] = useState<number | "">(currentThreshold);
  const [charge, setCharge] = useState<number | "">(currentCharge);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault(); 

    // Convert empty strings to 0 for validation
    const numThreshold = threshold === "" ? 0 : threshold;
    const numCharge = charge === "" ? 0 : charge;

    // Double safety check on client
    if (numThreshold < 0 || numCharge < 0) {
      toast.error("Values cannot be negative! 🚫");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("threshold", numThreshold.toString());
        formData.append("charge", numCharge.toString());

        // 🛡️ Server Action ALREADY handles Role Check, Zod Validation, and Fixed ID
        const result = await updateStoreSettings(formData);
        
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Shipping rules updated globally! 🚚");
        }
      } catch (error) {
        console.error("Shipping update failed:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-4xl mt-8">
      <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
        <Truck className="text-indigo-600" size={24} /> Delivery & Shipping Rules
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-8">Set the minimum cart value for free shipping and standard delivery charges.</p>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Free Shipping Threshold (₹)
            </label>
            <input 
              required
              type="number" 
              min="0" 
              step="1"
              value={threshold}
              // 🛡️ FIX 5: Cleaner onChange handling to prevent NaN when user clears input
              onChange={(e) => setThreshold(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg"
            />
            <p className="text-xs text-slate-400 mt-2">Orders above this amount will get free delivery.</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Standard Delivery Charge (₹)
            </label>
            <input 
              required
              type="number" 
              min="0" 
              step="1"
              value={charge}
              // 🛡️ FIX 5: Cleaner onChange handling
              onChange={(e) => setCharge(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg"
            />
            <p className="text-xs text-slate-400 mt-2">Charge applied if cart value is below threshold.</p>
          </div>
        </div>

        <button
          type="submit" 
          // Disable if nothing changed or pending
          disabled={isPending || (threshold === currentThreshold && charge === currentCharge)}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Update Shipping Rules</>}
        </button>
      </form>
    </div>
  );
}