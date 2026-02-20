"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 🛡️ FIX 1: Strict TypeScript Interfaces
export interface SalesDataPoint {
  date: string;
  sales: number;
}

export default function SalesChart({ data }: { data: SalesDataPoint[] }) {
  // ⚡ Hydration Pattern: Current method is completely fine and safe for Recharts.
  // Alternatively, you could use `next/dynamic` in the parent component.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-72 w-full flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Analytics...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>;
  }

  // 🛡️ FIX 1 & 2: Client-Side Defense-in-Depth (Sanitize & Coerce)
  // Ensures that even if backend sends dirty data, the chart won't break or execute XSS
  const safeData = data.map(d => ({
    date: String(d.date || ""),
    sales: Number(d.sales) || 0 // Force numeric, defaults to 0 if malicious string
  }));

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
            // 🎨 UX FIX: Formatted with Indian commas (e.g. ₹1,50,000)
            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
            itemStyle={{ color: '#4F46E5', fontWeight: 'black' }}
            // 🎨 UX FIX: Tooltip also gets formatted correctly
            // 'any' lagane se TypeScript shant ho jayega aur undefined handle ho jayega
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#4F46E5"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSales)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}