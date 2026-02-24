"use client";

import { Megaphone, Save, Loader2 } from "lucide-react";
import { updateStoreSettings } from "@/lib/actions";
import toast from "react-hot-toast";
import { useTransition } from "react";

export default function AnnouncementManager({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        const result = await updateStoreSettings(formData);
        
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Store Announcement Updated! 🚀");
        }
      } catch (error) {
        console.error("Failed to update settings", error);
        toast.error("Failed to update settings. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
          <Megaphone size={24} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight text-center">Store Announcement Bar</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Announcement Message</label>
          <input 
            name="text" 
            defaultValue={settings?.announcementText}
            placeholder="e.g. 🎉 Grand Opening Sale: 30% OFF!" 
            maxLength={100} 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:border-indigo-400 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Coupon Code</label>
            <input 
              name="code" 
              defaultValue={settings?.couponCode}
              placeholder="e.g. SAVE30" 
              pattern="^[a-zA-Z0-9]{3,20}$"
              title="3 to 20 alphanumeric characters, no spaces"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black uppercase text-indigo-600 focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
            {/* 🚀 FIX: Changed name from "active" to "showAnnouncement" so Server Action can catch it */}
            <select 
              name="showAnnouncement" 
              defaultValue={settings?.showAnnouncement?.toString()}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer"
            >
              <option value="true">Active (Show)</option>
              <option value="false">Inactive (Hide)</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
             <><Loader2 size={20} className="animate-spin" /> Saving...</>
          ) : (
             <><Save size={20} /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
}