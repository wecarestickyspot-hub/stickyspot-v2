"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyOrderId({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2 second baad wapas normal
  };

  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all active:scale-95"
      title="Copy Full Order ID"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
    </button>
  );
}