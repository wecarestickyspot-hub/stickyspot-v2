"use client";

import { useState, useEffect } from "react";
import { MapPin, Truck, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    status: 'success' | 'error', 
    date?: string, 
    cod?: boolean, 
    msg?: string,
    city?: string,
    state?: string,
    isExpress?: boolean
  } | null>(null);

  // 🚀 AUTO-CHECKER: Runs automatically when pincode is valid
  useEffect(() => {
    // 🛡️ FIX 7: Pre-validate realistic Indian pincodes (doesn't start with 0)
    const isValidIndianPincode = /^[1-9]\d{5}$/.test(pincode);

    if (pincode.length === 6 && isValidIndianPincode) {
      checkDeliveryDetails(pincode);
    } else {
      // Clear result immediately if user deletes a digit or enters invalid sequence
      setResult(null); 
    }
  }, [pincode]);

  const checkDeliveryDetails = async (code: string) => {
    const currentCode = code; // 🛡️ FIX 1: Capture snapshot of current request
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/shiprocket/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: currentCode })
      });
      
      // 🛡️ FIX 2: Ensure 500s or rate limit 429s don't break JSON parsing
      if (!response.ok) {
         if (response.status === 429) throw new Error("Too many checks. Please wait a moment.");
         throw new Error("Service temporarily unavailable.");
      }
      
      const data = await response.json();

      // 🛡️ FIX 1: RACE CONDITION PREVENTION
      // If user typed something else while this request was flying, ignore this response
      if (currentCode !== pincode) return;

      if (data.success) {
        setResult({ 
          status: 'success', 
          date: data.date, 
          cod: data.cod,
          city: data.city,
          state: data.state,
          isExpress: data.isExpress
        });
      } else {
        setResult({ status: 'error', msg: data.message || "Delivery not available to this pincode." });
      }
    } catch (error: any) {
       // Prevent flashing error if user already started typing a new pincode
       if (currentCode !== pincode) return;
       
       setResult({ status: 'error', msg: error.message || "Network error. Please try again." });
    } finally {
       if (currentCode === pincode) {
         setLoading(false);
       }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-indigo-600" />
        <h3 className="font-bold text-slate-900">Delivery & Services</h3>
      </div>

      {/* Input Field (Auto-Check UX) */}
      <div className="relative">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} // Only numbers
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm tracking-widest"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {result.status === 'success' ? (
            <div className="space-y-4 bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl">
              
              {/* City Name Header */}
              {result.city && (
                <div className="flex items-center gap-2 border-b border-emerald-100/50 pb-3">
                  <Truck size={16} className="text-emerald-600" />
                  <p className="text-sm font-bold text-slate-700">
                    Delivering to <span className="text-slate-950 uppercase">{result.city}, {result.state}</span>
                  </p>
                </div>
              )}

              {/* Delivery Date */}
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-black text-slate-900">
                    Get it by <span className="text-emerald-600">{result.date}</span>
                  </p>
                  {result.isExpress ? (
                     <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1"><Zap size={12}/> Express Delivery Available</p>
                  ) : (
                     <p className="text-xs font-medium text-slate-500 mt-1">Standard Shipping</p>
                  )}
                </div>
              </div>
              
              {/* COD Available */}
              {result.cod && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">₹</div>
                  <p className="text-xs font-bold text-slate-700">Cash on Delivery is available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{result.msg}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}