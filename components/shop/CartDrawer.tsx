"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Loader2, Check } from "lucide-react";
import { useEffect, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { validateCoupon } from "@/lib/actions";
import toast from "react-hot-toast";
import CldImage from "@/components/shared/CldImage";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    couponCode,
    applyDiscount,
    removeDiscount,
    getCartTotal,
    freeShippingThreshold,
    shippingCharge
  } = useCartStore();

  const router = useRouter();

  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  // 🛡️ iOS-safe Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll";
    } else {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    }
    return () => {
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [isOpen]);

  // --- 🧮 100% SAFE CALCULATION ---
  const { subtotal, finalTotal, discount: usedDiscount } = getCartTotal();

  const totalQuantityCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const safeThreshold = freeShippingThreshold > 0 ? freeShippingThreshold : 1;

  const amountLeftForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.round(Math.min(100, (subtotal / safeThreshold) * 100));

  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingCharge;
  const totalToPay = (finalTotal || 0) + (shipping || 0);

  // 🤫 Silent Coupon Revalidation
  useEffect(() => {
    if (couponCode && subtotal > 0 && isOpen) {
      validateCoupon(couponCode, subtotal).then(result => {
        if (result.error) {
          removeDiscount();
          toast.error(`Coupon "${couponCode}" is no longer valid for this cart amount.`);
          setMessage(null);
        } else if (result.success && result.discount !== usedDiscount) {
          applyDiscount(result.discount, result.code!);
        }
      });
    }
  }, [subtotal, couponCode, isOpen, removeDiscount, applyDiscount, usedDiscount]);

  // --- HANDLERS ---
  const handleApplyCoupon = () => {
    if (!inputCode.trim()) return;
    setMessage(null);

    startTransition(async () => {
      const normalizedCode = inputCode.trim().toUpperCase();
      const result = await validateCoupon(normalizedCode, subtotal);

      if (result.error) {
        setMessage({ text: result.error, type: 'error' });
        removeDiscount();
      } else if (result.success) {
        setMessage({ text: "Coupon Applied Successfully! 🎉", type: 'success' });
        applyDiscount(result.discount!, result.code!);
        setInputCode("");
      }
    });
  };

  const handleRemoveCoupon = () => {
    removeDiscount();
    setMessage(null);
    setInputCode("");
  };

  const handleUpdateQuantity = (id: string, currentQty: number, change: number, maxStock?: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    if (change > 0 && maxStock !== undefined && newQty > maxStock) {
      toast.error(`Only ${maxStock} items available in stock.`);
      return;
    }
    updateQuantity(id, newQty);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* 🔮 Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
        aria-label="Close cart"
      />

      {/* 🛒 Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white/95 backdrop-blur-3xl shadow-2xl border-l border-white/50 animate-in slide-in-from-right duration-300 flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <ShoppingBag size={22} className="text-indigo-600" /> Your Cart
            {totalQuantityCount > 0 && (
              <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md text-sm font-bold ml-1">
                {totalQuantityCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close cart drawer"
            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors border border-slate-100"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Dynamic Free Shipping Progress Bar */}
        {freeShippingThreshold > 0 && items.length > 0 && (
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 shrink-0">
            <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              {amountLeftForFreeShipping > 0 ? (
                <>Add <span className="text-indigo-600">₹{amountLeftForFreeShipping.toFixed(0)}</span> more for FREE Shipping!</>
              ) : (
                <><ShieldCheck size={16} className="text-emerald-500" /> You've unlocked FREE Shipping!</>
              )}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${amountLeftForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-2 shadow-inner">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Your cart is empty</h3>
              <p className="text-slate-500 font-medium text-sm max-w-[250px]">Looks like you haven't added any premium stickers yet.</p>
              <button
                onClick={() => { setIsOpen(false); router.push("/shop"); }}
                className="mt-4 px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product List */}
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-20 h-20 bg-white border border-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-sm p-1.5">
                      <CldImage src={item.image} alt={item.title} fill sizes="80px" className="object-contain p-1.5" />
                    </div>

                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{item.title}</h4>
                          {/* Bundle Tag Indicator */}
                          {(item as any).isBundle && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-wider rounded border border-pink-100">
                              Bundle
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title} from cart`}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1 shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-black text-slate-900">₹{item.price}</span>

                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl shadow-sm">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="text-slate-500 hover:text-slate-900 disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, +1, item.stock)}
                            className="text-slate-500 hover:text-slate-900 disabled:opacity-30"
                            disabled={item.quantity >= (item.stock || 100)}
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🎟️ Coupon Section */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 block">Promo Code</label>

                {couponCode ? (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 text-white p-1.5 rounded-lg"><Check size={16} strokeWidth={3} /></div>
                      <div>
                        <p className="text-slate-900 font-black text-sm tracking-wider uppercase">{couponCode}</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-0.5">Discount Applied</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} aria-label="Remove coupon" className="p-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X size={14} strokeWidth={2.5} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <input
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isPending || !inputCode || !!couponCode}
                      className="shrink-0 bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors flex justify-center items-center"
                    >
                      {isPending ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}

                {message && !couponCode && (
                  <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${message.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {message.type === 'error' ? <X size={12} /> : <Check size={12} />} {message.text}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 🧾 Footer / Checkout Area */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0 z-20">
            <div className="space-y-2 mb-4 text-sm font-medium text-slate-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">₹{subtotal.toFixed(2)}</span>
              </div>

              {usedDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="flex items-center gap-1.5"><Tag size={14} /> {couponCode}</span>
                  <span className="font-bold">- ₹{usedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                {shipping === 0 ? <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider">Free</span> : <span className="text-slate-900 font-bold">₹{shipping.toFixed(2)}</span>}
              </div>

              <div className="flex flex-col border-t border-slate-100 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-indigo-600">₹{isNaN(totalToPay) ? "0.00" : totalToPay.toFixed(2)}</span>
                </div>

                {usedDiscount > 0 && (
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-emerald-500 font-black tracking-wide uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      You saved ₹{usedDiscount.toFixed(2)} 🎉
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={items.length === 0}
              onClick={() => { setIsOpen(false); router.push("/checkout"); }}
              className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-full hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] font-black tracking-widest uppercase text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure Encrypted Checkout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}