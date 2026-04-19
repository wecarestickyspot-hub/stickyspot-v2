"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "@/components/shop/AddToCartButton";

type Product = {
  id: string;
  title: string;
  price: number;
  images: string[];
  slug: string;
  stock: number;
  category: string;
};

export default function StickyCartBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after user scrolls past the main Add to Cart button (~500px)
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible || product.stock === 0) return null;

  return (
    // Only show on mobile (lg pe normal button visible hai)
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Product mini info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-900 truncate">{product.title}</p>
          <p className="text-sm font-black text-indigo-600">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Add to Cart */}
        <div className="shrink-0 w-44">
          <AddToCartButton product={product} compact />
        </div>
      </div>

      {/* Safe area for notch phones */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </div>
  );
}