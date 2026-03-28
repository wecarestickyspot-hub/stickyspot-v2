import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

// 🚀 FIX: params ab Promise type ka hoga
export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 🚀 FIX: Next.js 15 ka naya rule -> params ko pehle await karo!
  const resolvedParams = await params;

  // 1. Admin sirf Order ID se data nikalega (userId check nahi chahiye)
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id }, // 👈 Ab ye perfectly chalega
    include: { items: true } 
  });

  if (!order) redirect("/admin/orders");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/admin/orders" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-bold text-sm w-fit transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Order #{order.id.slice(-6).toUpperCase()}</h1>
            <p className="text-slate-500 mt-1 font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest border border-indigo-100">
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><User size={18}/> Customer Details</h2>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            <p className="text-slate-500 text-sm">{order.email}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><MapPin size={18}/> Shipping Address</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{order.address}</p>
          </div>
        </div>

        <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><Package size={18}/> Items Ordered</h2>
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <span className="font-bold text-slate-700">{item.title} (x{item.quantity})</span>
              <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold uppercase tracking-widest text-sm text-slate-400">Total Paid</span>
            <span className="font-black text-xl">₹{Number(order.amount).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}