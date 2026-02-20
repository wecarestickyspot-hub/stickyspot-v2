import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock, ChevronRight, ExternalLink, Receipt, Printer, XCircle, AlertTriangle } from "lucide-react";
import CldImage from "@/components/shared/CldImage";

export const revalidate = 0;

export const metadata = {
  title: "My Orders | StickySpot",
  description: "Track and manage your StickySpot orders.",
};

const STATUS_MAP: Record<string, { label: string; icon: any; colorClass: string }> = {
  PENDING: { label: "Pending Payment", icon: Clock, colorClass: "text-slate-600 bg-slate-100 border-slate-200 shadow-slate-100" },
  PAID: { label: "Order Placed", icon: CheckCircle2, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-100" },
  PROCESSING: { label: "Processing", icon: Clock, colorClass: "text-amber-600 bg-amber-50 border-amber-200 shadow-amber-100" },
  PRINTING: { label: "Printing Custom", icon: Printer, colorClass: "text-blue-600 bg-blue-50 border-blue-200 shadow-blue-100" },
  SHIPPED: { label: "Shipped", icon: Truck, colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200 shadow-indigo-100" },
  DELIVERED: { label: "Delivered", icon: CheckCircle2, colorClass: "text-teal-600 bg-teal-50 border-teal-200 shadow-teal-100" },
  CANCELLED: { label: "Cancelled", icon: XCircle, colorClass: "text-rose-600 bg-rose-50 border-rose-200 shadow-rose-100" },
  REFUNDED: { label: "Refunded", icon: Receipt, colorClass: "text-slate-600 bg-slate-100 border-slate-200 shadow-slate-100" },
};

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let orders: any[] = [];
  let dbError = false; // 🛡️ FIX 5: Real Error Handling State

  try {
    orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20, 
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        trackingNumber: true,
        trackingUrl: true, // 🛡️ FIX 1: Explicitly selecting trackingUrl
        courierName: true, 
        items: {
          select: { id: true, title: true, price: true, quantity: true, image: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    dbError = true; 
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative overflow-x-hidden selection:bg-indigo-100">

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-200/40 rounded-full blur-[100px] transform-gpu" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-pink-100/30 rounded-full blur-[100px] transform-gpu" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 relative z-10">
        
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <Package size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Order History</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
            My <span className="text-indigo-600">Orders</span>
          </h1>
        </div>

        {dbError ? (
          // 🛡️ FIX 5: Proper DB Error State (Never hide errors as "Empty Cart")
          <div className="bg-white/60 backdrop-blur-xl border border-rose-100 rounded-[3rem] p-16 text-center shadow-sm animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100">
                <AlertTriangle size={32} strokeWidth={2} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Oops! Something went wrong</h2>
             <p className="text-slate-500 font-medium mb-8">We couldn't load your orders right now. Please try refreshing the page.</p>
          </div>
        ) : orders.length === 0 ? (
          // 🛍️ EMPTY STATE
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[3rem] p-16 text-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] animate-in zoom-in-95 duration-500">
            <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
              <Package size={48} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No orders yet</h2>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              Your laptop is looking a bit empty. Grab some premium waterproof stickers to vibe it up!
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-slate-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 group uppercase tracking-widest text-xs">
              Start Shopping <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {orders.map((order: any, idx: number) => {
              
              const normalizedStatus = order.status || "PROCESSING";
              const statusConfig = STATUS_MAP[normalizedStatus] || STATUS_MAP.PROCESSING;
              const StatusIcon = statusConfig.icon;
              const isShipped = normalizedStatus === "SHIPPED";
              const isDelivered = normalizedStatus === "DELIVERED";
              
              const trackingUrl = order.trackingUrl || (order.trackingNumber ? `https://shiprocket.co/tracking/${order.trackingNumber}` : null);
              const animDelay = Math.min(idx * 150, 600);

              return (
                <div 
                  key={order.id} 
                  id={`order-${order.id.slice(-8)}`} // 🛡️ FIX 4: Do not expose full UUID in DOM directly
                  className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:border-indigo-100 transition-all duration-500 animate-in fade-in slide-in-from-bottom-10 fill-both scroll-mt-24"
                  style={{ animationDelay: `${animDelay}ms` }}
                >
                  
                  {/* HEADER: Order Info & Status */}
                  <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Receipt size={16} className="text-slate-400" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</p>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">#{order.id.slice(-8)}</h3>
                      <p className="text-sm font-bold text-slate-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusConfig.colorClass}`}>
                        <StatusIcon size={14} strokeWidth={3} />
                        {statusConfig.label}
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</span>
                        <p className="text-slate-950 font-black text-2xl tracking-tighter">
                            ₹{Number(order.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 🚚 TRACKING SECTION */}
                  {(isShipped && !isDelivered) && (
                    <div className="bg-indigo-50/50 border-b border-indigo-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-100/50 to-transparent pointer-events-none" />
                      
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-600/20">
                          <Truck size={24} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                            {order.courierName ? `Shipped via ${order.courierName}` : 'Tracking Number (AWB)'}
                          </p>
                          {order.trackingNumber ? (
                              <p className="text-slate-900 font-mono font-black text-xl tracking-tight bg-white px-3 py-1 rounded-lg border border-indigo-100 inline-block shadow-sm">
                                {order.trackingNumber}
                              </p>
                          ) : (
                              <p className="text-slate-600 font-bold text-sm bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-100/50 inline-block">
                                Tracking info updating soon...
                              </p>
                          )}
                        </div>
                      </div>
                      
                      {trackingUrl && (
                          <a 
                            href={trackingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full md:w-auto relative z-10 bg-white border border-indigo-200 text-indigo-700 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                          >
                            Track Shipment <ExternalLink size={16} strokeWidth={2.5} />
                          </a >
                      )}
                    </div>
                  )}

                  {/* 📦 ITEMS LIST */}
                  <div className="p-6 md:p-8 bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Items in this order</p>
                        {/* 🛡️ FIX 8: Removed dummy Invoice button completely until backend is ready */}
                    </div>
                    
                    <div className="space-y-6">
                        {/* 🛡️ FIX 7: Empty items array fallback */}
                        {order.items?.length === 0 ? (
                           <p className="text-sm font-bold text-slate-400">No details available for these items.</p>
                        ) : (
                          order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-5 group">
                                <div className="relative w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0 p-2 shadow-sm group-hover:border-indigo-200 transition-colors">
                                {item.image ? (
                                    <CldImage 
                                    src={item.image} 
                                    alt={item.title} 
                                    fill 
                                    loading="lazy"
                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                                    sizes="80px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-black uppercase tracking-widest">No Img</div>
                                )}
                                </div>
                                
                                <div className="flex-1">
                                <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                                    <span className="text-xs font-medium text-slate-400">@ ₹{item.price} each</span>
                                </div>
                                </div>
                                
                                <div className="text-right">
                                {/* 🛡️ FIX 2: Strict Money Calculation (Number coercion) */}
                                <p className="text-lg font-black text-slate-900 tracking-tight">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                          ))
                        )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}