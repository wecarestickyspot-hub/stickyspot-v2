"use client";

import { ShoppingCart, Check, Minus, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

// 🛡️ FIX 4: Strict Type Safety (No more 'any')
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
  // 🛡️ FIX 2 & 🧠 ADVANCED UX: Fetch items to check existing quantity, and setIsOpen to open drawer
  const { items, addItem, setIsOpen } = useCartStore();
  
  const [isAdded, setIsAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 🛡️ FIX 3: Spam protection
  const [quantity, setQuantity] = useState(1);

  // 🧠 REAL ECOMMERCE LOGIC: Calculate how much the user can ACTUALLY add
  const existingItem = items.find((item) => item.id === product.id);
  const existingQuantity = existingItem?.quantity || 0;
  const maxAddable = product.stock - existingQuantity;

  // 🛡️ SCROLL JUMP FIX: Increase Quantity
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity < maxAddable) {
      setQuantity((prev) => prev + 1);
    } else {
      // Alert user if they hit the stock limit based on their cart
      toast.error(`Only ${maxAddable} more left in stock!`);
    }
  };

  // 🛡️ SCROLL JUMP FIX: Decrease Quantity
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // 🛡️ SCROLL JUMP FIX: Add to Cart
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 🛡️ FIX 1 & 3: Final validation guard before processing
    if (isProcessing || product.stock === 0 || maxAddable <= 0) {
      if (maxAddable <= 0) toast.error("Maximum stock limit reached in your cart!");
      return;
    }

    if (quantity > maxAddable) {
      toast.error(`Cannot add more than ${maxAddable} items.`);
      return;
    }

    setIsProcessing(true); // Lock button
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || "/placeholder.png",
      slug: product.slug,
      quantity: quantity,
      category: product.category,
      stock: 0
    });
    
    setIsAdded(true);
    
    // 🧠 ADVANCED UX: Open cart & show success toast
    setIsOpen(true);
    toast.success(`${quantity} item(s) added to cart! 🛒`);

    setTimeout(() => {
      setIsAdded(false);
      setIsProcessing(false); // Unlock button
      setQuantity(1); // Reset quantity selector
    }, 2000);
  };

  const isOutOfStock = product.stock === 0;
  const isCartFull = maxAddable <= 0 && !isOutOfStock;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        
        {/* ➖ QUANTITY SELECTOR ➕ */}
        <div className="flex items-center justify-between bg-white rounded-full px-2 py-2 border border-slate-200 shadow-sm sm:w-36 h-14 shrink-0">
          <button 
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock || isProcessing}
            aria-label="Decrease quantity" // 🛡️ FIX 5: Accessibility
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={18} strokeWidth={2.5}/>
          </button>
          
          <span className="font-black text-lg w-8 text-center select-none" aria-live="polite">
            {quantity}
          </span>
          
          <button 
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= maxAddable || isOutOfStock || isProcessing}
            aria-label="Increase quantity" // 🛡️ FIX 5: Accessibility
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* 🛒 ADD TO CART BUTTON */}
        <div className="flex-1 h-14 shadow-xl shadow-indigo-600/20 rounded-full">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || isCartFull || isProcessing}
            aria-label={isOutOfStock ? "Out of stock" : "Add product to cart"} // 🛡️ FIX 5: Accessibility
            className={`w-full h-full flex items-center justify-center gap-3 rounded-full font-bold text-base transition-all duration-300 transform active:scale-95 shadow-sm
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
               <Loader2 size={20} className="animate-spin" />
            ) : isAdded ? (
              <Check size={20} className="animate-in zoom-in duration-300" strokeWidth={2.5} />
            ) : (
              <ShoppingCart size={20} strokeWidth={2.5} />
            )}
            
            <span>
              {isAdded 
                ? "Added to Cart" 
                : isOutOfStock 
                  ? "Out of Stock" 
                  : isCartFull
                    ? "Max limit in Cart"
                    : `Add to Cart • ₹${product.price * quantity}`
              }
            </span>
          </button>
        </div>
      </div>

      {/* 💰 CONVERSION UPGRADE: Scarcity & FOMO Marketing */}
      {product.stock <= 5 && product.stock > 0 && (
        <p className="text-xs text-rose-500 font-bold px-2 text-center sm:text-left animate-pulse">
          Hurry! Only {product.stock} left in stock.
        </p>
      )}
    </div>
  );
}