import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight, Sparkles, ReceiptText, ShieldCheck, Loader2, Calendar, MapPin, Download } from "lucide-react";
import OrderEffects from "@/components/order/OrderEffects";
import CldImage from "@/components/shared/CldImage";

export const revalidate = 0; // Always fetch fresh data

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: user.id }, // 🛡️ Security: Enforce Ownership
    include: { items: true }
  });

  if (!order) redirect("/orders");

  const isPending = order.status === "PENDING";
  
  // 🧠 UX Upgrade: Calculate Estimated Delivery (e.g., +4 days from creation)
  const estDelivery = new Date(order.createdAt);
  estDelivery.setDate(estDelivery.getDate() + 4);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />

      {/* Inject our invisible logic engine */}
      <OrderEffects orderId={order.id} status={order.status} />

      {/* 🔮 Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-emerald-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-32 pb-20">
        
        {/* ⏳ PENDING STATE (Waiting for Webhook) */}
        {isPending ? (
           <div className="text-center bg-white border border-slate-100 p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-lg w-full animate-in zoom-in-95 duration-500">
               <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mx-auto mb-8" strokeWidth={2} />
               <h1 className="text-3xl font-black mb-4">Verifying Payment...</h1>
               <p className="text-slate-500 font-medium leading-relaxed">
                   Please don't close or refresh this window. We are securely syncing your transaction with Razorpay.
               </p>
           </div>
        ) : (
           // 🎉 PAID / SUCCESS STATE 
           <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 rounded-full animate-pulse scale-150"></div>
                        <div className="relative bg-white border border-emerald-100 p-6 rounded-full shadow-xl shadow-emerald-500/5">
                            <CheckCircle className="text-emerald-500 h-20 w-20" strokeWidth={2} />
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                                <Sparkles size={16} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
                        Order <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 italic">Confirmed.</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        We're getting your premium stickers ready! 
                    </p>
                </div>

                {/* 🧠 UX Upgrade: Order Summary Mini-Preview */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden mb-10">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-8 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Order ID</p>
                            {/* 🛡️ FIX 5: Show DB Order ID, not Payment ID */}
                            <p className="font-mono font-black text-slate-900 text-lg">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Paid
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <Calendar className="text-indigo-500 shrink-0 mt-0.5" size={20}/>
                            <div>
                                <p className="font-bold text-slate-900">Estimated Delivery</p>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">By {estDelivery.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={20}/>
                            <div>
                                <p className="font-bold text-slate-900">Shipping To</p>
                                <p className="text-sm font-medium text-slate-500 mt-0.5 leading-relaxed">{order.customerName}<br/>{order.address}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Amount</p>
                                <p className="text-sm font-bold text-slate-900">{order.items.length} Items</p>
                            </div>
                            <p className="text-3xl font-black text-slate-950 tracking-tighter">₹{Number(order.amount).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                {/* 🧠 UX Upgrade: Post-purchase Trust & Review Seed */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-10 flex items-center justify-between">
                    <p className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500"/> Check your email for shipping updates!
                    </p>
                    {/* Invoice Placeholder Button */}
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-50">
                        <Download size={14} /> Invoice
                    </button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link href="/shop" className="flex-1">
                        <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 text-sm">
                            <ShoppingBag size={18} /> Continue Shopping
                        </button>
                    </Link>
                    <Link href="/orders" className="flex-1">
                        <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm">
                            View All Orders <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>

                <div className="mt-12 flex justify-center items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <ShieldCheck size={14} className="text-emerald-500" /> Secure Fulfillment via StickySpot Pro
                </div>
           </div>
        )}

      </div>
    </div>
  );
}