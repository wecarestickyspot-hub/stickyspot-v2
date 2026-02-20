"use client";

import React, { useEffect } from "react";
import { ShieldCheck, Zap, AlertCircle, CheckCircle2, CreditCard } from "lucide-react";

interface PaymentSelectorProps {
  paymentMethod: "prepaid" | "cod";
  setPaymentMethod: (method: "prepaid" | "cod") => void;
  prepaidDiscount: number; // 💰 For dynamic psychology message
  cartTotal: number;       // 📊 For Risk Control (Min COD value)
}

export default function PaymentSelector({ 
  paymentMethod, 
  setPaymentMethod, 
  prepaidDiscount, 
  cartTotal 
}: PaymentSelectorProps) {
  
  // 📊 5. Risk Control: Disable COD if cart value is too low
  const isCodDisabled = cartTotal < 299;

  // Auto-switch to prepaid if COD becomes disabled (e.g. user removes item)
  useEffect(() => {
    if (isCodDisabled && paymentMethod === "cod") {
      setPaymentMethod("prepaid");
    }
  }, [isCodDisabled, paymentMethod, setPaymentMethod]);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
      <h2 className="text-xl font-black border-b border-slate-100 pb-5 mb-8 text-slate-900 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">2</span> 
        Payment Method
      </h2>

      <div className="space-y-4">
        
        {/* 🟢 PREPAID OPTION */}
        <label
          className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            paymentMethod === "prepaid"
              ? "border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-500/10 scale-[1.02]" // 🚀 6. Micro-Conversion Upgrade
              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
          }`}
        >
          {/* ♿ 2. Accessibility Fix: Actual Radio Input */}
          <input
            type="radio"
            name="paymentMethod"
            value="prepaid"
            checked={paymentMethod === "prepaid"}
            onChange={() => setPaymentMethod("prepaid")}
            className="sr-only" // Visually hidden but semantically correct
          />

          <div className="flex items-start sm:items-center gap-4">
            <div className={`mt-1 sm:mt-0 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              paymentMethod === "prepaid" ? "border-indigo-600" : "border-slate-300"
            }`}>
              {paymentMethod === "prepaid" && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-in zoom-in" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
                   <CreditCard size={18}/> Pay Online
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  <Zap size={12} /> Recommended
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">UPI, Cards, Wallets via Razorpay</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:text-right ml-10 sm:ml-0">
            <span className="inline-block bg-indigo-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
              Get 10% Extra OFF ✨
            </span>
          </div>
        </label>


        {/* 🟡 COD OPTION */}
        <div className="relative">
          <label
            className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
              isCodDisabled 
                ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50 grayscale-[50%]"
                : "cursor-pointer " + (paymentMethod === "cod"
                  ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10"
                  : "border-slate-200 hover:border-amber-300 hover:bg-slate-50")
            }`}
          >
            {/* ♿ 2. Accessibility Fix: Actual Radio Input */}
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              disabled={isCodDisabled}
              onChange={() => setPaymentMethod("cod")}
              className="sr-only"
            />

            <div className="flex items-start sm:items-center gap-4">
              <div className={`mt-1 sm:mt-0 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                paymentMethod === "cod" ? "border-amber-500" : "border-slate-300"
              }`}>
                {paymentMethod === "cod" && <div className="w-3 h-3 bg-amber-500 rounded-full animate-in zoom-in" />}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg mb-1">Cash on Delivery</div>
                <p className="text-sm text-slate-500 font-medium">Pay via Cash/UPI on delivery</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:text-right ml-10 sm:ml-0">
              <span className="inline-block bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                {/* 💰 3. Psychology Upgrade */}
                ₹50 Verification Fee
              </span>
            </div>
          </label>
          
          {/* 📊 5. Risk Control Warning */}
          {isCodDisabled && (
            <p className="text-xs font-bold text-rose-500 mt-2 ml-2 animate-in fade-in">
              * COD is available only on orders above ₹299
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="mt-6">
        {paymentMethod === "prepaid" ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-emerald-800 font-bold text-sm">Awesome choice! 🎉</p>
              {/* 💰 3. Psychology Upgrade: Dynamic Numbers */}
              <p className="text-emerald-600 text-sm mt-1">
                You saved ₹{prepaidDiscount}! Your order ships first from our warehouse.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-800 font-bold text-sm">Action Required for COD</p>
              <p className="text-amber-700 text-sm mt-1">
                A ₹50 Verification Fee (to prevent fake orders) is added. You will receive a verification call/WhatsApp before dispatch.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}