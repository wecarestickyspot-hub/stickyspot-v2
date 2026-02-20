import { prisma } from "@/lib/prisma";
import CreateCouponForm from "@/components/admin/CreateCouponForm";
import CouponTable from "@/components/admin/CouponTable"; // 👇 Naya Client Component
import { TicketPercent, CopyPlus } from "lucide-react";

export default async function CouponsPage() {
  // ⚡ Fast Server-Side Fetching (With Basic Pagination Idea: take 50)
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    take: 50, // Limits initial load for scalability
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT/TOP: CREATE FORM */}
        <div className="xl:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-fit sticky top-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
                <CopyPlus className="text-indigo-500" size={20} />
                Generate New Code
            </h2>
            <CreateCouponForm />
        </div>

        {/* RIGHT/BOTTOM: COUPONS LIST (Client Component for UX) */}
        <div className="xl:col-span-2">
          <CouponTable coupons={coupons} />
        </div>

      </div>
    </div>
  );
}