"use client";

import { setUserRole } from "@/lib/actions";
import { useState, useTransition } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function RoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  // 🧠 FIX 8: Use local state for immediate UI reflection and handling external updates
  const [localRole, setLocalRole] = useState(currentRole || "USER");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    const previousRole = localRole;

    // Optimistic UI update
    setLocalRole(newRole);

    const formData = new FormData();
    formData.append("id", userId);
    formData.append("role", newRole);

    startTransition(async () => {
      try {
        // Hum seedha User ID aur Naya Role pass karenge
        // 'userId' aapke component ke props mein hoga, aur 'newRole' select box se aa raha hoga
        const result = await setUserRole(userId, newRole);

        if (result?.error) {
          // Revert UI if server rejects
          setLocalRole(previousRole);
          toast.error(result.error);
        } else {
          toast.success(`Access updated to ${newRole} 🛡️`);
        }
      } catch (error) {
        setLocalRole(previousRole);
        toast.error("Failed to update role. Please try again.");
      }
    });
  };

  return (
    <div className="relative inline-flex items-center group/select min-w-[150px]">
      {/* 🔄 Loading Spinner (Side positioning) */}
      {isPending && (
        <div className="absolute -left-7 animate-in fade-in slide-in-from-right-2">
          <Loader2 size={16} className="animate-spin text-indigo-600" />
        </div>
      )}

      <div className="relative w-full">
        <select
          value={localRole} // Controlled component now
          onChange={handleChange}
          disabled={isPending}
          className={`
            appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all border outline-none
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
            
            /* ✨ Premium Light Theme Colors */
            bg-white border-slate-200 text-slate-600 
            hover:border-indigo-400 hover:bg-indigo-50/30 
            hover:text-indigo-700
            
            /* 🎯 Focus State */
            focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500
          `}
        >
          <option value="USER" className="text-slate-900 font-bold bg-white">User (Customer)</option>
          <option value="SUPPORT" className="text-slate-900 font-bold bg-white">Support Team</option>
          <option value="ADMIN" className="text-slate-900 font-bold bg-white">Admin (Manager)</option>
          <option value="SUPER_ADMIN" className="text-slate-900 font-bold bg-white">Super Admin (Boss)</option>
        </select>

        {/* 🎨 Custom Floating Arrow Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-indigo-600 transition-colors">
          <ChevronDown size={14} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
}