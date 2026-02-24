"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu, X, LayoutDashboard, Package, ShoppingCart, 
  LogOut, Users, TicketPercent, Boxes, Settings, ShieldCheck 
} from "lucide-react";
import AdminSidebarItem from "./AdminSidebarItem";

export default function AdminMobileMenu({ role, isOwner }: { role: string, isOwner: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 📱 Mobile Top Bar (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">StickySpot <span className="text-indigo-600 text-[10px] uppercase">Pro</span></span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 active:scale-95 transition-transform">
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 🌑 Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🍔 Mobile Drawer (Sliding Menu) */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-rose-50 text-rose-500 rounded-full active:scale-90 transition-transform">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-1.5 overflow-y-auto" onClick={() => setIsOpen(false)}>
          <AdminSidebarItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          
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

          {(role === "SUPER_ADMIN" || isOwner) && (
            <div className="mt-8">
              <div className="pb-3 px-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Controls</p>
              </div>
              <AdminSidebarItem href="/admin/users" icon={<Users size={20} />} label="Team & Roles" />
              <AdminSidebarItem href="/admin/settings" icon={<Settings size={20} />} label="Global Settings" />
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
            <LogOut size={18} strokeWidth={2.5} /> Exit to Store
          </Link>
        </div>
      </div>
    </>
  );
}