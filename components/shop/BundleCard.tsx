"use client";

import { useCartStore } from "@/store/useCartStore";
import { Plus, Sparkles, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import CldImage from "@/components/shared/CldImage"; 
import { useState } from "react";

interface BundleProduct {
  id: string;
  images: string[] | string; // 🛡️ Safely handle both string or array
  stock: number;
  price: number;
}

interface Bundle {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  description: string;
  products: BundleProduct[];
}

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const { items, addItem, setIsOpen } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // 🧠 REAL ECOMMERCE LOGIC: Calculate max available stock for this bundle
  const minAvailableStock = bundle.products?.length > 0 
    ? Math.min(...bundle.products.map((p) => p.stock || 0)) 
    : 0;

  // Calculate Original Price (Sum of individual product prices)
  const originalPrice = bundle.products?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;
  const savings = originalPrice - bundle.price;

  // Check how many of this bundle are already in the cart
  const existingBundleInCart = items.find((item) => item.id === bundle.id);
  const existingQuantity = existingBundleInCart?.quantity || 0;
  
  // The actual number the user is allowed to add
  const maxAddable = minAvailableStock - existingQuantity;
  const isOutOfStock = minAvailableStock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || isOutOfStock) return;

    if (maxAddable <= 0) {
      toast.error("Maximum stock limit reached for this bundle!");
      return;
    }

    setIsProcessing(true);

    addItem({
      id: bundle.id,
      title: bundle.title,
      price: bundle.price,
      image: bundle.image,
      slug: bundle.slug,
      quantity: 1, 
      isBundle: true, 
      // 🚀 FIX 1: Send the product IDs to the cart so checkout knows what to deduct!
      bundleProductIds: bundle.products.map(p => p.id), 
      stock: minAvailableStock, 
      category: "Bundle" 
    });

    setIsAdded(true);
    setIsOpen(true);
    toast.success(`${bundle.title} added to cart! 🎁`);

    setTimeout(() => {
      setIsAdded(false);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="group relative bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 flex flex-col h-full">
      {/* Badge */}
      <div className="absolute top-4 right-4 z-10 bg-indigo-600 text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
        <Sparkles size={12} className="animate-pulse" /> VALUE PACK
      </div>

      {/* Image Wrap */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-900 shrink-0">
        <CldImage 
          src={bundle.image || "/placeholder.png"} 
          alt={bundle.title} 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        
        {/* Overlay with included product icons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent flex gap-2">
           {bundle.products?.slice(0, 4).map((p) => {
             // 🛡️ FIX 2: Safely extract image whether it's an array or string
             const imgSrc = Array.isArray(p.images) ? p.images[0] : (p.images || "/placeholder.png");
             
             return (
               <div key={p.id} className="w-8 h-8 rounded-full border border-white/20 bg-black/50 overflow-hidden relative shadow-sm">
                  <CldImage src={imgSrc} alt="Product" fill className="object-cover" />
               </div>
             )
           })}
           {bundle.products?.length > 4 && (
             <div className="w-8 h-8 rounded-full border border-white/20 bg-black/80 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
               +{bundle.products.length - 4}
             </div>
           )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {bundle.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-6">
          {bundle.description}
        </p>

        {/* Bottom Action Area */}
        <div className="mt-auto">
          {/* 💰 CONVERSION HACK: Show Savings */}
          {savings > 0 && !isOutOfStock && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 line-through font-medium">₹{originalPrice}</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md">Save ₹{savings}</span>
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Bundle Price</p>
              <p className="text-2xl font-black text-white">₹{bundle.price}</p>
            </div>
            
            <button 
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock || isProcessing || maxAddable <= 0}
              aria-label={isOutOfStock ? "Out of stock" : "Add bundle to cart"}
              className={`p-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center
                ${isAdded 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : (isOutOfStock || maxAddable <= 0)
                    ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                    : "bg-white text-black hover:bg-indigo-600 hover:text-white"
                }
              `}
            >
              {isProcessing && !isAdded ? (
                 <Loader2 size={24} className="animate-spin" />
              ) : isAdded ? (
                <Check size={24} strokeWidth={3} className="animate-in zoom-in" />
              ) : (
                <Plus size={24} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>
        
        {/* 💰 CONVERSION HACK: Urgency */}
        {minAvailableStock <= 3 && minAvailableStock > 0 && (
          <p className="text-[10px] text-rose-500 font-bold mt-4 uppercase tracking-widest animate-pulse">
            🔥 Limited stock! Only {minAvailableStock} bundles left.
          </p>
        )}
        
        {isOutOfStock && (
          <p className="text-[10px] text-white/40 font-bold mt-4 uppercase tracking-widest text-center">
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );
}