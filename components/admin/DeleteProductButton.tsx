"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions"; 
import { useUser } from "@clerk/nextjs";
import { useTransition } from "react";
import toast from "react-hot-toast";

export default function DeleteProductButton({ id, productName }: { id: string, productName?: string }) {
  const { user, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();

  // 🧠 FIX 1: Prevent UI Flashing
  // Return a tiny placeholder/spinner of the exact same size instead of null
  // so the layout doesn't shift when Clerk finally loads.
  if (!isLoaded) {
    return (
      <div className="p-2 rounded-full border border-transparent w-9 h-9 flex items-center justify-center">
        <Loader2 size={14} className="animate-spin text-slate-200" />
      </div>
    );
  }

  // 3. UI Security Check: Hide button if not SUPER_ADMIN
  // 🛡️ Note: REAL security is already handled in our Server Action!
  const role = user?.publicMetadata?.role as string;
  if (role !== "SUPER_ADMIN") {
    return null; 
  }

  const handleDelete = () => {
    const itemName = productName ? `"${productName}"` : "this product";
    
    // 🛑 Prevent accidental clicks
    if (window.confirm(`Are you sure you want to archive/delete ${itemName}?`)) {
      startTransition(async () => {
        // 🛡️ FIX 2: Added Try/Catch to prevent silent UI breakage if server throws
        try {
          const formData = new FormData();
          formData.append("id", id);
          
          const result = await deleteProduct(formData);
          
          if (result?.success) {
            toast.success(result.message || "Product safely archived! 📦");
          } else {
            toast.error(result?.message || "Failed to remove product.");
          }
        } catch (error) {
          console.error("Delete action failed:", error);
          toast.error("An unexpected server error occurred.");
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      title="Archive Product"
      className={`p-2 rounded-full border transition-all shadow-sm ${
        isPending 
          ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed" 
          : "bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
      }`}
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5} />}
    </button>
  );
}