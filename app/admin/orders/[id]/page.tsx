import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, CreditCard } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { OrderStatusSelector } from "@/components/admin/AdminActions"; // 👈 API Update ke liye aapka purana component
import CopyOrderId from "./CopyOrderId"; // 👈 Naya Copy Button (Neeche code diya hai)
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // 🔒 6. ADMIN PROTECTION (Bulletproof Security)
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const isOwner = user?.emailAddresses?.[0]?.emailAddress === process.env.ADMIN_EMAIL;

  if (!user || (role !== "ADMIN" && role !== "SUPER_ADMIN" && !isOwner)) {
    redirect("/");
  }

  // 🚀 NEXT.JS 15 RULE: Await params
  const resolvedParams = await params;

  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: { items: true } 
  });

  if (!order) redirect("/admin/orders");

  return (
    // 📱 4. MOBILE OPTIMIZATION: p-4 sm:p-8 kar diya hai
    <div className="p-4 sm:p-8 max-w-5xl mx-auto font-sans">
      <Link href="/admin/orders" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-bold text-sm w-fit transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Order #{order.id.slice(-6).toUpperCase()}
              </h1>
              {/* ⚡ 5. ORDER ID COPY BUTTON */}
              <CopyOrderId orderId={order.id} />
            </div>
            <p className="text-slate-500 mt-1 font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          
          {/* 🔥 1. ORDER STATUS UPDATE (Interactive Component) */}
          <div className="w-full md:w-auto">
             <OrderStatusSelector id={order.id} currentStatus={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><User size={18}/> Customer Details</h2>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            <p className="text-slate-500 text-sm">{order.email}</p>
            
            {/* 💰 2. PAYMENT METHOD SHOW KARO */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
               <CreditCard size={16} className="text-slate-400" />
               <p className="text-sm text-slate-500">
                  Payment: <span className="font-bold text-slate-900 px-2 py-1 bg-white rounded-md border border-slate-200">{order.paymentMethod || "PREPAID"}</span>
               </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100">
            <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><MapPin size={18}/> Shipping Address</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{order.address}</p>
          </div>
        </div>

        <h2 className="flex items-center gap-2 font-black text-slate-700 mb-4"><Package size={18}/> Items Ordered</h2>
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                {/* 📦 3. PRODUCT IMAGE BHI SHOW KARO (BIG UX BOOST) */}
                {item.image ? (
                  <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package size={20} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-700 line-clamp-1">{item.title}</span>
                  <span className="text-xs font-bold text-slate-400">Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="font-black text-slate-900 shrink-0">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center">
            <span className="font-bold uppercase tracking-widest text-xs sm:text-sm text-slate-400">Total Paid</span>
            <span className="font-black text-xl sm:text-2xl">₹{Number(order.amount).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}