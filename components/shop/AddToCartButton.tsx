"use client";

import { ShoppingCart, Check, Minus, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

// 🛡️ FIX 4: Strict Type Safety
export interface CartProduct {
  id: string;
  title: string;
  price: number;
  images?: string[];
  slug: string;
  stock: number;
  category: string;
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { items, addItem, setIsOpen } = useCartStore();
  
  const [isAdded, setIsAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [quantity, setQuantity] = useState(1);

  const existingItem = items.find((item) => item.id === product.id);
  const existingQuantity = existingItem?.quantity || 0;
  const maxAddable = product.stock - existingQuantity;

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity < maxAddable) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error(`Only ${maxAddable} more left in stock!`);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessing || product.stock === 0 || maxAddable <= 0) {
      if (maxAddable <= 0) toast.error("Maximum stock limit reached in your cart!");
      return;
    }

    if (quantity > maxAddable) {
      toast.error(`Cannot add more than ${maxAddable} items.`);
      return;
    }

    setIsProcessing(true); 
    
    // 🚀 THE ULTIMATE FIX: Passed the actual product stock instead of 0
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      slug: product.slug,
      quantity: quantity,
      category: product.category,
      stock: product.stock // <--- Yahan 0 tha, isko fix kar diya hai!
    });
    
    setIsAdded(true);
    
    // 🧠 ADVANCED UX: Open cart & show success toast
    if (setIsOpen) setIsOpen(true);
    toast.success(`${quantity} item(s) added to cart! 🛒`);

    setTimeout(() => {
      setIsAdded(false);
      setIsProcessing(false); 
      setQuantity(1); 
    }, 2000);
  };

  const isOutOfStock = product.stock === 0;
  const isCartFull = maxAddable <= 0 && !isOutOfStock;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center gap-3 w-full">
        
        {/* ➖ QUANTITY SELECTOR ➕ */}
        <div className="flex items-center justify-between bg-white rounded-full px-1.5 py-1.5 border border-slate-200 shadow-sm w-[110px] sm:w-36 h-12 sm:h-14 shrink-0">
          <button 
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock || isProcessing}
            aria-label="Decrease quantity" 
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={16} strokeWidth={2.5}/>
          </button>
          
          <span className="font-black text-base sm:text-lg w-6 sm:w-8 text-center select-none" aria-live="polite">
            {quantity}
          </span>
          
          <button 
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxAddable || isOutOfStock || isProcessing}
            aria-label="Increase quantity" 
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* 🛒 ADD TO CART BUTTON */}
        <div className="flex-1 h-12 sm:h-14 shadow-xl shadow-indigo-600/20 rounded-full">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || isCartFull || isProcessing}
            aria-label={isOutOfStock ? "Out of stock" : "Add product to cart"} 
            className={`w-full h-full flex items-center justify-center gap-2 sm:gap-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform active:scale-95 shadow-sm
              ${
                isAdded 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : (isOutOfStock || isCartFull)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20"
              }
            `}
          >
            {isProcessing && !isAdded ? (
               <Loader2 size={18} className="animate-spin" />
            ) : isAdded ? (
              <Check size={18} className="animate-in zoom-in duration-300" strokeWidth={2.5} />
            ) : (
              <ShoppingCart size={18} strokeWidth={2.5} />
            )}
            
            <span className="truncate">
              {isAdded 
                ? "Added" 
                : isOutOfStock 
                  ? "Out of Stock" 
                  : isCartFull
                    ? "Max in Cart"
                    : <><span className="hidden sm:inline">Add to Cart • </span>₹{product.price * quantity}</>
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}