import { prisma } from "@/lib/prisma";
import CreateCouponForm from "@/components/admin/CreateCouponForm";
import CouponTable from "@/components/admin/CouponTable"; 
import { TicketPercent, CopyPlus, Zap, EyeOff, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  // ⚡ Fast Parallel Fetching for Dashboard Stats + Table Data
  const [coupons, totalActive, publicCount, totalUses] = await Promise.all([
    prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.coupon.count({ where: { isActive: true } }),
    prisma.coupon.count({ where: { isActive: true, isPublic: true } }),
    prisma.coupon.aggregate({ _sum: { usedCount: true } })
  ]);

  const secretCount = totalActive - publicCount;
  const uses = totalUses._sum.usedCount || 0;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* ─── HEADER ─── */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <TicketPercent className="text-indigo-600" size={36} strokeWidth={2.5} />
            Coupons Manager
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Create promo codes to run sales and boost conversions.
          </p>
        </div>
      </div>

      {/* ─── 📊 KPI DASHBOARD (NAYA) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Active Public</p>
            <p className="text-2xl font-black text-slate-900">{publicCount} <span className="text-sm font-bold text-slate-400">codes</span></p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <EyeOff size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Secret / Private</p>
            <p className="text-2xl font-black text-slate-900">{secretCount} <span className="text-sm font-bold text-slate-400">codes</span></p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Uses</p>
            <p className="text-2xl font-black text-slate-900">{uses} <span className="text-sm font-bold text-slate-400">times</span></p>
          </div>
        </div>
      </div>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT: CREATE FORM */}
        <div className="xl:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-fit sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                <CopyPlus className="text-indigo-500" size={20} />
                Generate New Code
            </h2>
            <CreateCouponForm />
        </div>

        {/* RIGHT: COUPONS LIST */}
        <div className="xl:col-span-2">
          <CouponTable coupons={coupons as any} />
        </div>

      </div>
    </div>
  );
}