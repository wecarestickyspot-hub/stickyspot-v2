"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, ShoppingCart, Check, Zap, Star } from "lucide-react";
import WishlistButton from "@/components/shared/WishlistButton";
import { useCartStore } from "@/store/useCartStore"; 
import { useState } from "react";
import CldImage from "../shared/CldImage";
import toast from "react-hot-toast";

interface ProductProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewsCount?: number;
  image: string;
  category: string;
  currentUser?: any;
  isWishlisted?: boolean;
  stock?: number;
  createdAt?: Date | string;
  hideWishlist?: boolean; // 🚀 NAYA PROP: Wishlist chhupane ke liye (For faster Homepage)
}

export default function ProductCard({
  id, title, slug, price, originalPrice, rating = 4.8, reviewsCount = 124, image, category, currentUser, isWishlisted = false, stock, createdAt, hideWishlist = false,
}: ProductProps) {
  
  const addItem = useCartStore((state) => state.addItem);
  const setIsOpen = useCartStore((state) => state.setIsOpen); 
  
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = stock === 0 || stock === undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdded || isOutOfStock) return;

    addItem({ id, title, price, image, slug, quantity: 1, category, stock: stock || 0 });
    
    setIsAdded(true);
    toast.success(`${title} added to cart! 🛒`);
    
    if (setIsOpen) {
      setIsOpen(true); 
    }
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isNew = createdAt ? (new Date().getTime() - new Date(createdAt).getTime()) < (14 * 24 * 60 * 60 * 1000) : false;
  const isLowStock = stock && stock < 10 && stock > 0;

  return (
    <article 
      data-product-id={id}
      data-product-category={category}
      className="group relative bg-white border border-slate-100 rounded-3xl sm:rounded-[2.5rem] overflow-hidden hover:border-indigo-200 hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full z-0 font-sans"
    >
      
      {/* --- IMAGE SECTION --- */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        {/* 🚀 FIX 1: STRICTLY TOP-LEFT BADGE (NEW DROP) */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 pointer-events-none">
            {isNew && (
                <span className="bg-white/90 backdrop-blur-md border border-white text-indigo-600 text-[8px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1 sm:gap-1.5 uppercase tracking-[0.1em]">
                    <Zap size={10} className="fill-indigo-600" /> <span className="hidden sm:inline">New Drop</span><span className="sm:hidden">New</span>
                </span>
            )}
        </div>

        {/* 🚀 FIX 2: STRICTLY BOTTOM-LEFT BADGE (SELLING FAST) */}
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 z-20 pointer-events-none">
            {isLowStock && (
                <span className="bg-rose-50/90 backdrop-blur-md border border-rose-100 text-rose-600 text-[8px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1 sm:gap-1.5 uppercase tracking-[0.1em] animate-pulse">
                    <Flame size={10} className="fill-rose-500" /> <span className="hidden sm:inline">Selling Fast</span><span className="sm:hidden">Fast</span>
                </span>
            )}
        </div>

        {/* 🚀 FIX 3: Wishlist Button - TOP-RIGHT (Conditionally rendered & Mobile Scaled) */}
        {!hideWishlist && (
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 pointer-events-auto">
            {/* Added scale-75 sm:scale-100 so it doesn't look giant on mobile */}
            <div className="bg-white/80 backdrop-blur-md rounded-[0.85rem] sm:rounded-2xl shadow-md hover:shadow-lg border border-white p-0.5 sm:p-1 hover:scale-110 transition-transform scale-75 sm:scale-100 origin-top-right">
                <WishlistButton productId={id} isWishlisted={isWishlisted} isLoggedIn={!!currentUser} />
            </div>
          </div>
        )}

        {/* 🔍 SEO & IMAGE */}
        <Link href={`/product/${slug}`} title={`View details for ${title}`} className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
          <div className="relative w-full h-full">
            <CldImage
              src={image || "/placeholder.png"} 
              alt={`${title} sticker`} 
              fill
              loading="lazy"
              className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-2xl text-transparent"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              priority={false}
            />
          </div>
        </Link>
      </div>

      {/* --- INFO SECTION --- */}
      <div className="p-4 sm:p-6 sm:pt-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2 sm:mb-3 flex-wrap gap-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] bg-slate-50 px-2 sm:px-2.5 py-1 rounded-lg">
                {category}
            </span>
            {isLowStock && (
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-bold text-rose-500 bg-rose-50 px-2 sm:px-2.5 py-1 rounded-lg">
                    <Clock size={10} strokeWidth={2.5} className="sm:w-3 sm:h-3" /> Only {stock} left
                </div>
            )}
        </div>

        <Link href={`/product/${slug}`} className="block flex-1 mb-3 sm:mb-4">
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 pr-2 mb-1.5">
            {title}
          </h2>
          
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400 sm:w-3 sm:h-3" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-700">{rating}</span>
            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">({reviewsCount})</span>
          </div>
        </Link>

        <div className="flex justify-between items-end mt-auto pt-2 border-t border-slate-50 sm:border-transparent">
          <div className="flex flex-col">
              {originalPrice && originalPrice > price && (
                 <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold mb-0.5">
                    ₹{originalPrice}
                 </span>
              )}
              <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tighter leading-none">₹{price}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${title} to cart`} 
            aria-disabled={isOutOfStock}
            className={`h-10 w-10 sm:w-auto sm:h-12 sm:px-6 rounded-xl sm:rounded-[1.25rem] font-black text-xs uppercase tracking-widest flex items-center justify-center sm:gap-2 transition-all duration-500 active:scale-90
              ${isAdded ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                : isOutOfStock ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-900/10"
              }`}
          >
            {isAdded ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
            <span className="hidden sm:inline">{isAdded ? "Added" : isOutOfStock ? "Out" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}