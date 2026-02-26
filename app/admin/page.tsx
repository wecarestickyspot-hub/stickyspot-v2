import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/actions"; // 👈 Ab ye actions file se aayega
import { 
  PlusCircle, TrendingUp, IndianRupee, ShoppingBag, 
  AlertTriangle, Package, ChevronRight, Pencil
} from 'lucide-react';
import SalesChart from "@/components/admin/SalesChart";
import { OrderStatusSelector } from '@/components/admin/AdminActions'; // Adjust path if needed
import { Suspense } from "react";
import Image from "next/image";

// ✅ 1. Cache Hardening: Admin pages must always show fresh data
export const dynamic = "force-dynamic";

// ✅ 2. Optimized Dashboard Stats Fetching
async function getDashboardData() {
  try {
    const [recentOrders, totalProducts, revenueAggregate, lowStockCount, totalOrders] = await Promise.all([
      // Fetch last 20 orders (excluding cancelled/pending for real view)
      prisma.order.findMany({
        where: { status: { notIn: ["CANCELLED", "PENDING"] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { items: { select: { title: true, image: true } } },
      }),
      // Count total products
      prisma.product.count(),
      // 🛡️ FIX: Calculate ACTUAL revenue (Only count paid/shipped/delivered)
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PROCESSING", "PRINTING", "SHIPPED", "DELIVERED"] } },
        _sum: { amount: true }
      }),
      // Count items needing restock
      prisma.product.count({ where: { stock: { lt: 10 } } }),
      // Real total count of valid orders
      prisma.order.count({
        where: { status: { notIn: ["CANCELLED", "PENDING"] } }
      })
    ]);

    return {
      recentOrders,
      totalProducts,
      totalRevenue: revenueAggregate._sum.amount ? Number(revenueAggregate._sum.amount) : 0,
      lowStockItems: lowStockCount,
      totalOrders
    };
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    return { recentOrders: [], totalProducts: 0, totalRevenue: 0, lowStockItems: 0, totalOrders: 0 };
  }
}

// ✅ 3. ISO & Timezone-Safe Chart Data Aggregation
async function getChartData() {
  try {
    const now = new Date();
    const salesMap = new Map();
    
    // 🛡️ FIX: Generate last 7 days perfectly synced to Indian Timezone (IST)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });
      salesMap.set(dateKey, { label: dateKey, sales: 0 });
    }

    // Fetch records for the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["PAID", "PROCESSING", "PRINTING", "SHIPPED", "DELIVERED"] } // Real money only
      },
      select: { createdAt: true, amount: true }
    });

    // Aggregate sales securely
    recentOrders.forEach(order => {
      const dateKey = order.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });
      if (salesMap.has(dateKey)) {
        const current = salesMap.get(dateKey);
        // Force Number to avoid string concatenation bugs
        salesMap.set(dateKey, { ...current, sales: current.sales + Number(order.amount) });
      }
    });

    return Array.from(salesMap.values()).map(v => ({ 
      date: v.label, 
      sales: v.sales 
    }));
  } catch (error) {
    console.error("Failed to load chart data:", error);
    return [];
  }
}

export default async function AdminDashboard() {
  /// 🛡️ Security Check: Layout ne pehle hi check kar liya hai, 
  // par agar aapko action check lagana hi hai, toh requireAdmin() use karein.
  
  // Agar aapke paas requireAdmin() function bani hai actions mein, toh wo use karein:
  // await requireAdmin(); 
  
  // YA FIR, yahan se isko hata dein kyunki AdminLayout ne pehle hi security handle kar li hai!

  // Parallel Fetching for UI speed
  const [stats, chartData, products] = await Promise.all([
    getDashboardData(),
    getChartData(),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, category: true, status: true, stock: true, price: true, images: true, slug: true }
    })
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-2">Manage your inventory, track orders, and analyze growth.</p>
          </div>
          <Link href="/admin/add-product">
            <button className="bg-slate-900 text-white px-6 py-3.5 rounded-full font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95">
              <PlusCircle size={20} strokeWidth={2.5} /> Add New Sticker
            </button>
          </Link>
        </div>

        {/* 📊 Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={<IndianRupee />} color="emerald" />
          <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString('en-IN')} icon={<TrendingUp />} color="indigo" />
          <StatCard title="Live Stickers" value={stats.totalProducts.toLocaleString('en-IN')} icon={<ShoppingBag />} color="purple" />
          <StatCard title="Low Stock" value={stats.lowStockItems} icon={<AlertTriangle />} color="rose" alert={stats.lowStockItems > 0} />
        </div>

        {/* 📈 Sales Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm mb-12">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} /> Revenue Trend (Last 7 Days)
          </h2>
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading Chart...</div>}>
            <SalesChart data={chartData} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* 📦 Recent Orders List */}
          <div className="xl:col-span-1 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-black flex items-center gap-3 text-slate-900">
                <Package className="text-indigo-600" size={20} /> Recent Orders
              </h2>
            </div>
            <div className="p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {stats.recentOrders.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-medium">No recent orders.</div>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                          {order.customerName} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-[10px] font-mono font-bold text-slate-400">#{order.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-600 font-black">₹{Number(order.amount).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
                      </div>
                    </div>
                    <OrderStatusSelector id={order.id} currentStatus={order.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 🏷️ Inventory Management Snippet */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Inventory Snippet</h2>
              <Link href="/admin/products" className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">View All Inventory</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white p-1">
                          <Image src={product.images?.[0] || "/placeholder.png"} alt={product.title} fill className="object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 line-clamp-1">{product.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</p>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black border ${product.stock < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                           STOCK: {product.stock}
                         </div>
                      </td>
                      <td className="p-4 font-black text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right">
                         <Link href={`/admin/edit-product/${product.id}`} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all inline-block">
                            <Pencil size={14} />
                         </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// 🧱 Reusable Stat Card Component
function StatCard({ title, value, icon, color, alert }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className={`bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center gap-5 shadow-sm transition-all hover:shadow-md ${alert ? 'border-rose-200 ring-4 ring-rose-500/5' : ''}`}>
      <div className={`p-4 rounded-2xl border ${colorMap[color]} ${alert ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.1em] mb-1">{title}</p>
        <h2 className={`text-3xl font-black ${alert ? 'text-rose-600' : 'text-slate-900'} tracking-tight`}>{value}</h2>
      </div>
    </div>
  );
}