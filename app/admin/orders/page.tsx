import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Package, ChevronLeft, ChevronRight, ShoppingBag, Clock, User } from "lucide-react";
import { OrderStatusSelector } from "@/components/admin/AdminActions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

// Constants
const ITEMS_PER_PAGE = 10;
export const dynamic = "force-dynamic"; // 🚫 Prevent caching for live orders

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // 🔒 1. Server-Side Admin Guard (UI + Data protection)
  const user = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!user || user.emailAddresses[0]?.emailAddress !== adminEmail) {
    redirect("/"); // Kick out non-admins
  }

  // 📄 2. Robust Pagination Parsing (Next.js 15 requires await)
  const resolvedParams = await searchParams;
  const rawPage = Number(resolvedParams.page);
  // Ensure page is a valid positive number, default to 1
  let currentPage = (!rawPage || isNaN(rawPage) || rawPage < 1) ? 1 : rawPage;

  // 📊 3. Total Count (Required for pagination math)
  const totalOrders = await prisma.order.count();
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  // Clamp page number to max available pages to prevent infinite empty pages
  if (currentPage > totalPages && totalPages > 0) {
    redirect(`/admin/orders?page=${totalPages}`);
  }

  // 🚀 4. Optimized Fetching (No overfetching of items array)
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    select: {
      id: true,
      customerName: true,
      email: true, // Assuming you added this to your Prisma schema based on previous usage
      amount: true,
      status: true,
      createdAt: true,
      // ⚡ FAANG-LEVEL: Only fetch the count of items, not the entire objects!
      _count: {
        select: { items: true }
      }
    }
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* --- HEADER --- */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-indigo-600" size={36} strokeWidth={2.5} />
            Orders Management
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Monitor and fulfill customer orders. Total <span className="font-bold text-indigo-600">{totalOrders}</span> orders received.
          </p>
        </div>
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
                        {/* ⚡ Using the optimized _count value */}
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
                            {/* Assuming email exists in your schema */}
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
                        {/* Ensure 'amount' is stored properly as a frozen snapshot at checkout */}
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
                        <p className="text-sm font-medium text-slate-500">Wait for your first customer to stick their vibe!</p>
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
              href={currentPage > 1 ? `/admin/orders?page=${currentPage - 1}` : "#"}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage > 1 
                    ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" 
                    : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronLeft size={18} strokeWidth={3} /> Prev
            </Link>
            
            <Link
              href={currentPage < totalPages ? `/admin/orders?page=${currentPage + 1}` : "#"}
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