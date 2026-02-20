"use client";

import { createCoupon } from "@/lib/actions";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useRef } from "react";

// Submit Button Component (for Loading State)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 mt-2 active:scale-95"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
      {pending ? "Generating Code..." : "Generate Promo Code"}
    </button>
  );
}

export default function CreateCouponForm() {
  // 🧠 FIX 8: Ref added to reset the form after success
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        try {
          const res = await createCoupon(formData);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Coupon generated successfully! 🎉");
            formRef.current?.reset(); // Clear the form fields
          }
        } catch (error) {
          // 🧠 FIX 7: Fallback error handling if server crashes completely
          toast.error("Something went wrong on our end.");
          console.error("Coupon creation failed:", error);
        }
      }} 
      className="space-y-5"
    >
      
      {/* 1. Coupon Code */}
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Coupon Code</label>
        <div className="relative">
            <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input 
                required 
                name="code" 
                type="text" 
                placeholder="e.g. FESTIVAL50" 
                // Front-end hint, but REAL check is on backend
                pattern="^[a-zA-Z0-9]{3,20}$"
                title="3 to 20 alphanumeric characters only"
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-slate-900 uppercase placeholder:text-slate-300" 
            />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 2. Type */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
          <select 
            required 
            name="discountType" 
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
          >
            <option value="PERCENTAGE">% Off</option>
            <option value="FLAT">Flat ₹</option>
          </select>
        </div>

        {/* 3. Value */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Value</label>
          <input 
            required 
            name="value" 
            type="number" 
            min="1"
            placeholder="50" 
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-indigo-600 placeholder:text-slate-300" 
          />
        </div>
      </div>

      {/* 4. Expiry Date */}
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
        <input 
            required 
            name="endDate" 
            type="date" 
            // Set min date to today on frontend
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" 
        />
      </div>

      {/* 5. Usage Limit */}
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Usage Limit (Optional)</label>
        <input 
            name="usageLimit" 
            type="number" 
            min="1"
            placeholder="e.g. 100 uses" 
            className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300" 
        />
      </div>

      {/* Submit Button */}
      <SubmitButton />

    </form>
  );
}