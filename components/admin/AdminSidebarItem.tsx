"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

// 🧠 FIX 5: Wrapped in memo to prevent unnecessary re-renders if parent state changes
const AdminSidebarItem = memo(function AdminSidebarItem({ 
  href, 
  icon, 
  label 
}: { 
  href: string, 
  icon: React.ReactNode, 
  label: string 
}) {
  const pathname = usePathname();
  
  // 🛡️ FIX 2: Safer path matching (Avoids false positives like /admin/products matching /admin/products-analytics)
  const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <Link 
      href={href} 
      // ♿ FIX 3: Accessibility - Tells screen readers which item is currently active
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all group font-bold ${
        isActive 
        // 🎯 FIX 4: Replaced scale-[1.02] with ring to prevent subtle layout shifts
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100" 
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <span className={`${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
});

export default AdminSidebarItem;