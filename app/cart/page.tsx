"use client";

import Navbar from '@/components/shared/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Loader2, X, Check } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { validateCoupon } from '@/lib/actions';
import toast from 'react-hot-toast'; 

export default function CartPage() {
    const {
        items,
        updateQuantity,
        removeItem,
        couponCode,
        applyDiscount,
        removeDiscount,
        getCartTotal,
        freeShippingThreshold,
        shippingCharge
    } = useCartStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [inputCode, setInputCode] = useState("");
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isPending, startTransition] = useTransition();

    // --- 🧮 100% SAFE DYNAMIC CALCULATION ---
    const { subtotal, finalTotal, discount: usedDiscount } = getCartTotal();

    // Automatic Coupon Re-validation on Cart Change
    useEffect(() => {
        if (couponCode && subtotal > 0) {
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
    }, [subtotal, couponCode, removeDiscount, applyDiscount, usedDiscount]);

    if (!mounted) return null;

    // Safe Threshold Logic
    const threshold = Math.max(0, freeShippingThreshold);
    const safeThreshold = threshold > 0 ? threshold : 1; 

    const shipping = subtotal >= threshold || subtotal === 0 ? 0 : shippingCharge;
    const totalToPay = (finalTotal || 0) + (shipping || 0);

    const amountLeft = Math.max(0, threshold - subtotal);
    const progressPercent = Math.round(Math.min(100, (subtotal / safeThreshold) * 100));

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
                setMessage({ text: "Coupon applied successfully!", type: 'success' });
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

        if (maxStock !== undefined && newQty > maxStock) {
            toast.error(`Only ${maxStock} items available in stock.`);
            return;
        }
        updateQuantity(id, newQty);
    };

    return (
        <main className="min-h-screen text-slate-900 pb-20 font-sans relative overflow-x-hidden">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 relative z-10">
                <h1 className="text-4xl md:text-5xl font-black mb-10 text-slate-900 tracking-tight">
                    Shopping Cart <span className="text-slate-400 font-bold text-2xl">({items.length})</span>
                </h1>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border border-slate-200 rounded-[3rem] bg-white/40 backdrop-blur-xl shadow-sm">
                        <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-slate-100">
                            <ShoppingBag size={48} className="text-indigo-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-black mb-3 text-slate-900">Your cart is empty</h2>
                        <p className="text-slate-500 font-medium mb-8">Looks like you haven't added any premium stickers yet.</p>
                        <Link href="/shop" className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 text-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* 🛒 LEFT: Items List */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] items-center shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow group">
                                    <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2">
                                        <Image src={item.image} alt={item.title} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <Link href={`/product/${item.slug}`} className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                            {item.title}
                                        </Link>
                                        <div className="text-slate-500 text-sm font-black uppercase tracking-widest mt-2">{item.category}</div>
                                        <div className="text-2xl font-black text-slate-950 mt-2">₹{item.price}</div>
                                    </div>
                                    <div className="flex sm:flex-col items-center gap-4 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                        <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-1 shadow-sm">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            ><Minus size={16} strokeWidth={2.5} /></button>
                                            <span className="px-2 text-sm font-black w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, +1, item.stock)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all"
                                            ><Plus size={16} strokeWidth={2.5} /></button>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-full hover:bg-rose-50">
                                            <Trash2 size={16} /> <span className="sm:hidden">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 🧾 RIGHT: Order Summary */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] sticky top-32">
                                <h2 className="text-2xl font-black mb-8 text-slate-900">Order Summary</h2>

                                <div className="space-y-5 mb-8 text-slate-500 font-medium">
                                    <div className="flex justify-between items-center text-lg">
                                        <span>Subtotal</span>
                                        <span className="text-slate-900 font-bold">₹{(subtotal || 0).toFixed(2)}</span>
                                    </div>

                                    {usedDiscount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50">
                                            <span className="flex items-center gap-1.5"><Tag size={14} /> Discount {couponCode && `(${couponCode})`}</span>
                                            <span className="font-black">- ₹{(usedDiscount || 0).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span>Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-emerald-500 font-black uppercase tracking-wider text-xs">Free</span>
                                        ) : (
                                            <span className="text-slate-900 font-bold">₹{shipping}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200/80 pt-6 mt-6 flex justify-between items-end mb-8">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">₹{isNaN(totalToPay) ? "0.00" : totalToPay.toFixed(2)}</span>
                                </div>

                                {/* Manual Coupon Input */}
                                <div className="mb-8">
                                    <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-3 block">Promo Code</label>
                                    {couponCode ? (
                                        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-500 text-white p-2 rounded-xl"><Check size={18} strokeWidth={3} /></div>
                                                <div>
                                                    <p className="text-slate-900 font-black text-sm tracking-wider uppercase">{couponCode}</p>
                                                    <p className="text-xs text-emerald-500 font-bold mt-0.5">Discount Applied</p>
                                                </div>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"><X size={16} strokeWidth={2.5} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                                            <input
                                                value={inputCode}
                                                onChange={(e) => setInputCode(e.target.value)}
                                                placeholder="Enter code"
                                                className="w-full min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none uppercase"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isPending || !inputCode || !!couponCode}
                                                className="shrink-0 bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors flex justify-center items-center"
                                            >
                                                {isPending ? <Loader2 size={18} className="animate-spin" /> : "Apply"}
                                            </button>
                                        </div>
                                    )}

                                    {message && !couponCode && (
                                        <p className={`text-xs mt-3 font-bold flex items-center gap-1 ${message.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {message.type === 'error' ? <X size={14} /> : <Check size={14} />} {message.text}
                                        </p>
                                    )}
                                </div>

                                {/* Dynamic Free Shipping Progress Bar */}
                                {amountLeft > 0 && threshold > 0 && (
                                    <div className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span>You're <span className="text-indigo-600">₹{amountLeft.toFixed(0)}</span> away from <span className="text-emerald-600">FREE SHIPPING 🚚</span></span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>
                                )}

                                <Link href={items.length === 0 ? "#" : "/checkout"} className="w-full block">
                                    <button
                                        disabled={items.length === 0}
                                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 mb-5"
                                    >
                                        Proceed to Checkout <ArrowRight size={18} strokeWidth={2.5} />
                                    </button>
                                </Link>

                                <div className="flex justify-center items-center gap-2 text-xs font-bold text-slate-400">
                                    <ShieldCheck size={16} className="text-emerald-500" /> Secure Checkout via Razorpay
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}