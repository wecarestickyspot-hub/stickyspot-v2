import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Package, ChevronLeft, ChevronRight, ShoppingBag, Clock, User, Filter } from "lucide-react";
import { OrderStatusSelector } from "@/components/admin/AdminActions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Constants
const ITEMS_PER_PAGE = 10;
export const dynamic = "force-dynamic";

// 🛡️ 1. Scalable Admin Guard Helper
async function requireAdmin() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress; // 🐛 FIX: Safe chaining
  
  if (!user || userEmail !== process.env.ADMIN_EMAIL) {
    redirect("/"); 
  }
  return user;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  // 🔒 Run Admin Check
  await requireAdmin();

  // 📄 Next.js 15: Await searchParams
  const resolvedParams = await searchParams;
  const rawPage = Number(resolvedParams.page);
  let currentPage = (!rawPage || isNaN(rawPage) || rawPage < 1) ? 1 : rawPage;
  
  // 🎯 Filter Logic
  const statusFilter = resolvedParams.status;
  const whereClause = statusFilter ? { status: statusFilter as any } : {};

  // 📊 2. Quick Stats Fetching (Parallel for Speed)
  const [totalOrders, pendingCount, shippedCount, unverifiedCount] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "UNVERIFIED" } })
  ]);

  // 🧮 3. Pagination Safe Math (Fixed Edge Case)
  const totalPages = Math.max(1, Math.ceil(totalOrders / ITEMS_PER_PAGE));

  if (currentPage > totalPages && totalOrders > 0) {
    redirect(`/admin/orders?page=${totalPages}${statusFilter ? `&status=${statusFilter}` : ''}`);
  }

  // 🚀 4. Optimized Data Fetching
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }, // 💡 TIP: Ensure @@index([createdAt]) is in your Prisma schema!
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    select: {
      id: true,
      customerName: true,
      email: true, 
      amount: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } }
    }
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* --- 🚀 HEADER & QUICK STATS --- */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-indigo-600" size={36} strokeWidth={2.5} />
            Orders Management
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Monitor and fulfill customer orders efficiently.
          </p>
        </div>

        {/* 🔥 Quick Operations Stats */}
        <div className="flex flex-wrap gap-3">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                {unverifiedCount} Unverified
            </div>
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {pendingCount} Processing
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {shippedCount} Shipped
            </div>
        </div>
      </div>

      {/* --- 🎯 FILTERS --- */}
      <div className="mb-6 flex overflow-x-auto pb-2 custom-scrollbar gap-2">
         <div className="flex items-center gap-2 mr-4 text-slate-400 font-black text-xs uppercase tracking-widest">
            <Filter size={14} /> Filter:
         </div>
         {['ALL', 'UNVERIFIED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
             <Link 
                key={status}
                href={`/admin/orders${status === 'ALL' ? '' : `?status=${status}`}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    (status === 'ALL' && !statusFilter) || statusFilter === status
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                 {status}
             </Link>
         ))}
      </div>

      {/* --- ORDERS TABLE --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Order Info</th>
                <th className="px-6 py-5">Customer Details</th>
                <th className="px-6 py-5">Order Date</th>
                <th className="px-6 py-5">Total Amount</th>
                <th className="px-6 py-5">Fulfillment Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* ID & Items Count */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded-md w-fit border border-indigo-100/50">
                            #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mt-1">
                            <Package size={10} /> {order._count.items} {order._count.items === 1 ? 'Item' : 'Items'}
                        </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{order.customerName || "Guest User"}</span>
                            {order.email && <span className="text-xs font-medium text-slate-400 truncate max-w-[150px]">{order.email}</span>}
                        </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-black text-slate-950 text-lg">
                        <span className="text-xs font-bold text-slate-400">₹</span>
                        {order.amount.toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Status Selector Component */}
                  <td className="px-6 py-5">
                    <OrderStatusSelector id={order.id} currentStatus={order.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                    >
                      <Eye size={14} strokeWidth={3} /> Details
                    </Link>
                  </td>

                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                            <ShoppingBag size={32} className="text-slate-300" strokeWidth={1.5} />
                        </div>
                        <p className="text-xl font-black text-slate-900 mb-1">No orders found</p>
                        <p className="text-sm font-medium text-slate-500">
                            {statusFilter ? `No orders in ${statusFilter} status.` : 'Wait for your first customer to stick their vibe!'}
                        </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 gap-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
          </p>

          <div className="flex gap-2">
            <Link
              href={currentPage > 1 ? `/admin/orders?page=${currentPage - 1}${statusFilter ? `&status=${statusFilter}` : ''}` : "#"}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage > 1 
                    ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" 
                    : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronLeft size={18} strokeWidth={3} /> Prev
            </Link>
            
            <Link
              href={currentPage < totalPages ? `/admin/orders?page=${currentPage + 1}${statusFilter ? `&status=${statusFilter}` : ''}` : "#"}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage < totalPages 
                    ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" 
                    : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              Next <ChevronRight size={18} strokeWidth={3} />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}