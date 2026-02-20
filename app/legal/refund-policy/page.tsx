import { RefreshCcw, CreditCard, Scissors, XCircle, Mail, MessageCircle, ShieldCheck, ArrowLeft, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// 🔍 FIX 4: SEO Optimization & Metadata
export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | StickySpot",
  description: "Read StickySpot's official refund, return, and cancellation policy for premium custom stickers in India.",
  alternates: {
    canonical: "https://www.stickyspot.in/refund-policy",
  },
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative overflow-x-hidden">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm text-indigo-700 text-xs font-black uppercase tracking-widest">
             <ShieldCheck size={14} strokeWidth={2.5} /> Trust & Safety
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
            Refund & <span className="text-indigo-600">Cancellation</span> Policy
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            We value your trust. Here is our legally binding policy regarding returns, refunds, and cancellations for all StickySpot purchases.
          </p>
          {/* SEO Signal & Trust Builder */}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
            Last Updated: 16 February 2026
          </p>
        </div>

        {/* ⚖️ Legal Accordion Style List */}
        <section aria-labelledby="refund-policy" className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-10 shadow-sm mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            <div className="space-y-10">
                {/* 1. Cancellation */}
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">1. Order Cancellations</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            Orders can only be cancelled if their status is marked as <strong>PENDING</strong> or <strong>PROCESSING</strong>. 
                            Once an order moves to the <strong>PRINTING</strong> or <strong>SHIPPED</strong> stage, cancellations are strictly not allowed as materials have already been utilized.
                        </p>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Returns */}
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-100">
                        <RefreshCcw size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">2. Returns & Replacements</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-3">
                            We accept returns/replacements within <strong>7 days</strong> of delivery ONLY under the following conditions:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 text-sm md:text-base space-y-2 ml-4">
                            <li>The product received is defective, damaged, or completely different from what was ordered.</li>
                            <li><strong>Mandatory Proof:</strong> Customers must provide a clear, uncut unboxing video highlighting the defect to be eligible for a replacement or refund.</li>
                        </ul>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 3. Non-Returnable Items (Legal Protection) */}
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 border border-rose-100">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">3. Non-Returnable & Non-Refundable Items</h2>
                        <ul className="list-disc list-inside text-slate-600 text-sm md:text-base space-y-2 ml-4 mb-3">
                            <li><strong>Custom Stickers:</strong> Since custom prints are unique to you, they cannot be returned or refunded unless there is a severe manufacturing defect.</li>
                            <li>Products that have been used, peeled, or damaged by the customer.</li>
                            <li>Minor color variations (Print colors may slightly differ from digital screen colors).</li>
                            <li>Orders delayed due to incorrect shipping addresses provided by the customer.</li>
                        </ul>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 4. Refund Process & Exclusions */}
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">4. Refund Processing & Exclusions</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-3">
                            Once a refund is approved by our team, it will be processed securely via <strong>Razorpay</strong> to the original payment method within <strong>5-7 business days</strong> (as per RBI guidelines).
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 border border-slate-200">
                            <strong>Exclusions:</strong> Shipping charges, COD handling fees, and payment gateway convenience fees (if any) are <strong>non-refundable</strong>.
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 5. Force Majeure & Final Authority */}
                <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-white border border-slate-700">
                        <Info size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">5. Force Majeure & Final Authority</h2>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                            StickySpot is not liable for delivery delays caused by courier partners, natural disasters, or circumstances beyond our control. Furthermore, <strong>StickySpot reserves the right to approve or deny any return/refund request at its sole discretion.</strong>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* 🏢 Legal Entity Info (Compliance) */}
        <div className="text-center text-slate-400 text-xs font-medium mb-12 space-y-1">
             <p>Operated by: StickySpot Prints Pvt. Ltd.</p>
             <p>Registered Address: 123 Maker Street, Jaipur, Rajasthan, 302001, India</p>
        </div>

        {/* Help/Contact Footer */}
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-12 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight relative z-10">Need to raise a request?</h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm font-medium relative z-10">
              Please include your Order ID and unboxing video when emailing us for a faster resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="mailto:support@stickyspot.in" className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-slate-300 hover:text-slate-900 border border-white/10 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm">
                 <Mail size={18} strokeWidth={2.5} /> support@stickyspot.in
              </Link>
              <Link href="https://wa.me/919876543210" target="_blank" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-sm">
                 <MessageCircle size={18} strokeWidth={2.5} /> WhatsApp Support
              </Link>
            </div>
        </div>

        {/* 🔗 Cross Links (SEO Boost) */}
        <div className="mt-12 text-center pb-8 border-b border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Related Policies</p>
            <div className="flex justify-center gap-6 text-sm font-bold text-indigo-600">
                <Link href="/terms" className="hover:text-indigo-800 transition-colors">Terms & Conditions</Link>
                <Link href="/privacy" className="hover:text-indigo-800 transition-colors">Privacy Policy</Link>
                <Link href="/shipping" className="hover:text-indigo-800 transition-colors">Shipping Policy</Link>
            </div>
        </div>

        <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft size={14} strokeWidth={3} /> Back to Store
            </Link>
        </div>

      </div>
    </div>
  );
}