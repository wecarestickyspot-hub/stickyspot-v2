import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Users, 
  TicketPercent, 
  Boxes, 
  Settings,
  ShieldCheck
} from "lucide-react";
import AdminSidebarItem from "@/components/admin/AdminSidebarItem";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // 1. Safe Role Extraction with Fallback (Enterprise Upgrade 🚀)
  const role = (user?.publicMetadata?.role ?? "USER") as string;
  
  // ✅ FIX 1: Fetching Admin Email from Environment Variables
  const adminEmail = process.env.ADMIN_EMAIL;

  // 🛡️ 2. Security Check (Optimized Logic)
  const isAuthorized = role === "SUPER_ADMIN" || role === "ADMIN" || role === "SUPPORT";
  const isOwner = user?.emailAddresses?.some(e => e.emailAddress === adminEmail);

  // Kick out unauthorized users instantly before rendering anything
  if (!user || (!isAuthorized && !isOwner)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans overflow-hidden">

      {/* 📱 Sidebar (Premium Light Theme) */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
          <Link href="/admin" className="text-2xl font-black tracking-tight flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-indigo-100">
                <ShieldCheck className="text-white" size={24} />
            </div>
            <span>StickySpot</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase">Pro</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <AdminSidebarItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          
          {/* 🟡 Route-level UI Filtering based on roles */}
          {role !== "SUPPORT" && (
            <>
              <AdminSidebarItem href="/admin/products" icon={<Package size={20} />} label="Products" />
              <AdminSidebarItem href="/admin/bundles" icon={<Boxes size={20} />} label="Bundles & Combos" />
            </>
          )}

          <AdminSidebarItem href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          
          {role !== "SUPPORT" && (
             <AdminSidebarItem href="/admin/coupons" icon={<TicketPercent size={20} />} label="Coupons" />
          )}

          {/* Master Controls Section */}
          {(role === "SUPER_ADMIN" || isOwner) && (
            <div className="mt-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="pb-3 px-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Controls</p>
              </div>
              <AdminSidebarItem href="/admin/users" icon={<Users size={20} />} label="Team & Roles" />
              <AdminSidebarItem href="/admin/settings" icon={<Settings size={20} />} label="Global Settings" />
            </div>
          )}
        </nav>

        {/* Footer Area */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <Link href="/" className="flex items-center gap-3.5 px-4 py-3.5 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all group">
            <LogOut size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> Exit to Store
          </Link>
        </div>
      </aside>

      {/* 🖼️ Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar">
        {/* 🔮 Global Glass Background Orbs (Depth Layer) */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-200/20 rounded-full blur-[120px] transform-gpu animate-pulse" />
          <div className="absolute bottom-[-10%] left-[5%] w-[40vw] h-[40vw] bg-purple-200/20 rounded-full blur-[120px] transform-gpu" />
        </div>
        
        {/* Content Wrapper */}
        <div className="relative z-10 w-full min-h-full pb-10">
          {children}
        </div>
      </main>

    </div>
  );
}