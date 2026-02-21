import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Link from "next/link";
import { 
  CheckCircle, ShoppingBag, ArrowRight, Sparkles, 
  ShieldCheck, Loader2, Calendar, MapPin, Download, 
  Truck, Package, Info
} from "lucide-react";
import OrderEffects from "@/components/order/OrderEffects";

export const dynamic = "force-dynamic"; // 🛡️ Fix 1: Clear intent instead of revalidate = 0

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: user.id }, 
    include: { items: true }
  });

  if (!order) redirect("/orders");

  // 🛡️ Fix 2: Robust Pending Logic
  const isPending = ["PENDING", "PROCESSING", "PRINTING", "UNVERIFIED"].includes(order.status);
  
  // 🚀 Fix 3: Smart Estimated Delivery Logic
  const estDelivery = new Date(order.createdAt);
  if (order.status === "SHIPPED") {
    estDelivery.setDate(estDelivery.getDate() + 3); // 3 days after shipping
  } else if (order.paymentMethod === "COD") {
    estDelivery.setDate(estDelivery.getDate() + 6); // Extra time for COD processing
  } else {
    estDelivery.setDate(estDelivery.getDate() + 4); // Standard Prepaid
  }

  // 🎨 Status Timeline Logic
  const timelineStages = [
    { label: "Order Placed", isCompleted: true },
    { label: "Packed", isCompleted: ["SHIPPED", "DELIVERED"].includes(order.status) },
    { label: "Shipped", isCompleted: ["SHIPPED", "DELIVERED"].includes(order.status) },
    { label: "Delivered", isCompleted: order.status === "DELIVERED" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />

      <OrderEffects orderId={order.id} status={order.status} />

      {/* 🔮 Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-emerald-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 pt-32 pb-20">
        
        {/* ⏳ WAITING FOR PAYMENT / PROCESSING STATE */}
        {isPending ? (
           <div className="text-center bg-white border border-slate-100 p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-lg w-full animate-in zoom-in-95 duration-500">
               <Loader2 className="w-20 h-20 text-indigo-600 animate-spin mx-auto mb-8" strokeWidth={2} />
               <h1 className="text-3xl font-black mb-4">Verifying & Processing...</h1>
               <p className="text-slate-500 font-medium leading-relaxed">
                   We are securing your transaction and preparing your premium stickers. Hang tight!
               </p>
           </div>
        ) : (
           // 🎉 CONFIRMED / SHIPPED / DELIVERED STATE 
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
                </div>

                {/* 🚀 UX Upgrade 1: Visual Order Timeline */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-sm relative overflow-hidden">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                    
                    {timelineStages.map((stage, index) => (
                        <div key={stage.label} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${stage.isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {index === 0 && <CheckCircle size={14} />}
                                {index === 1 && <Package size={14} />}
                                {index === 2 && <Truck size={14} />}
                                {index === 3 && <Sparkles size={14} />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${stage.isCompleted ? 'text-indigo-900' : 'text-slate-400'}`}>
                                {stage.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Order Summary Card */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden mb-8">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-8 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Order ID</p>
                            <p className="font-mono font-black text-slate-900 text-lg">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> {order.status}
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

                        {/* 🛡️ Fix 4: Address Sanitization/Display Risk reduced by styling */}
                        <div className="flex items-start gap-4">
                            <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={20}/>
                            <div className="max-w-[250px] md:max-w-xs">
                                <p className="font-bold text-slate-900">Shipping To</p>
                                <p className="text-sm font-medium text-slate-500 mt-0.5 leading-relaxed truncate">{order.customerName}</p>
                                <p className="text-xs text-slate-400 line-clamp-2">{order.address}</p>
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

                {/* 🚀 UX Upgrade 2 & 3: Micro Copy & Working Buttons */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-medium text-indigo-900 flex items-start gap-2 max-w-xs">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5"/> 
                        Need help? Contact support within 24 hours for quick assistance.
                    </p>
                    <div className="flex gap-2 w-full md:w-auto">
                         {order.status === "SHIPPED" && order.trackingUrl ? (
                             <Link href={order.trackingUrl} target="_blank" className="flex-1 md:flex-none">
                                <button className="w-full flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-lg shadow-sm">
                                    <Truck size={14} /> Track
                                </button>
                             </Link>
                         ) : (
                             // 🛡️ Fix 5: Disabled Fake Button instead of broken one
                             <button disabled className="flex-1 md:flex-none flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-lg border border-slate-200 cursor-not-allowed" title="Invoice generation coming soon">
                                 <Download size={14} /> Invoice
                             </button>
                         )}
                    </div>
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
           </div>
        )}

      </div>
    </div>
  );
}