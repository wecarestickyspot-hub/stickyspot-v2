"use client";
import { useCartStore } from '@/store/useCartStore';
import { ShieldCheck, Lock, ArrowRight, Sparkles, MapPin, User, Mail, ShoppingBag, Tag, CreditCard, Banknote, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import Image from 'next/image';
import PaymentSelector from "@/components/checkout/PaymentSelector";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, discount, couponCode, freeShippingThreshold, shippingCharge } = useCartStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', pincode: '', state: ''
  });

  // 🚀 Payment & Secure OTP States
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "cod">("prepaid");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEnteredOtp, setUserEnteredOtp] = useState("");
  // generatedOtp state is REMOVED. Only server knows the OTP now.
  const [isVerifying, setIsVerifying] = useState(false);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans px-4 relative overflow-hidden text-center">
        <div className="bg-white/60 backdrop-blur-2xl border border-white p-12 rounded-[3rem] shadow-sm max-w-lg w-full z-10 mt-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                <ShoppingBag size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Cart is Empty</h1>
            <button onClick={() => router.push('/shop')} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-indigo-600 transition-all shadow-lg active:scale-95 w-full">
                Return to Shop
            </button>
        </div>
      </div>
    );
  }

  // 🧮 Calculation Logic
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const usedDiscount = discount || 0;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingCharge;
  const prepaidDiscountAmount = paymentMethod === "prepaid" ? Math.round(subtotal * 0.10) : 0;
  const codHandlingFee = paymentMethod === "cod" ? 50 : 0;
  const totalToPay = Math.max(0, subtotal - usedDiscount - prepaidDiscountAmount) + shipping + codHandlingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'pincode') {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (name === 'phone' && numericValue.length > 10) return;
        if (name === 'pincode' && numericValue.length > 6) return;
        setFormData({ ...formData, [name]: numericValue });
        return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // 📡 1. Trigger Secure OTP (Server Generated)
  const sendOtp = async () => {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formData.phone }), // Server generates and saves OTP
    });
    
    const data = await res.json();
    if (res.ok) {
      setShowOtpModal(true);
      toast.success("Verification code sent! 📱");
    } else {
      toast.error(data.error || "Failed to send code.");
    }
  };

  // 📝 2. Master Handler
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (formData.phone.length !== 10) return toast.error("Enter valid 10-digit Phone Number 📱");
    if (formData.pincode.length !== 6) return toast.error("Enter valid 6-digit Pincode 📍");

    if (paymentMethod === "cod") {
      if (subtotal < 299) return toast.error("COD available only on orders above ₹299.");
      setLoading(true);
      await sendOtp();
      setLoading(false);
    } else {
      await initiateRazorpay();
    }
  };

  // 🚀 3. Secure Verification & Order Placement
  const processCodOrder = async () => {
    setIsVerifying(true);
    const toastId = toast.loading("Verifying code...");

    try {
      // Step A: Verify OTP on Server
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp: userEnteredOtp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setIsVerifying(false);
        return toast.error(verifyData.error || "Incorrect Code", { id: toastId });
      }

      // Step B: Only if verified, create order
      const orderPayload = createPayload();
      const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
      });
      
      const orderData = await response.json();
      if (response.ok && orderData.success) {
        toast.success("Order Placed! Verification Successful ✅", { id: toastId });
        router.push(`/orders/${orderData.dbOrderId}?clear_cart=true`);
      } else {
        toast.error(orderData.error || "Order failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Internal server error", { id: toastId });
    } finally {
      setIsVerifying(false);
      setShowOtpModal(false);
    }
  };

  // 💳 4. Razorpay Flow (Remains Secure)
  const initiateRazorpay = async () => {
    if (!window.Razorpay) return toast.error("Payment gateway loading...");
    setLoading(true);
    const toastId = toast.loading("Opening payment gateway...");

    try {
      const orderPayload = createPayload();
      const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
      });
      
      const orderData = await response.json();
      if (!response.ok) {
          toast.error(orderData.error || "Order initiation failed", { id: toastId });
          setLoading(false);
          return;
      }

      const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "StickySpot.",
          order_id: orderData.razorpayOrderId, 
          handler: async function (res: any) {
              const verifyRes = await fetch('/api/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      razorpay_order_id: res.razorpay_order_id,
                      razorpay_payment_id: res.razorpay_payment_id,
                      razorpay_signature: res.razorpay_signature
                  })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                  router.push(`/orders/${orderData.dbOrderId}?clear_cart=true`);
              }
          },
          prefill: { name: formData.name, email: formData.email, contact: formData.phone },
          theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Unexpected error occurred", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const createPayload = () => ({
    items: items.map(i => ({
      productId: i.id, quantity: i.quantity,
      isCustom: i.category === "Custom",
      customPrice: i.category === "Custom" ? i.price : undefined,
      customTitle: i.category === "Custom" ? i.title : undefined,
      customImage: i.category === "Custom" ? i.image : undefined
    })),
    couponCode: couponCode || null,
    customerDetails: { ...formData, name: formData.name.trim(), email: formData.email.trim() },
    paymentMethod: paymentMethod
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* 📱 SECURE OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isVerifying && setShowOtpModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setShowOtpModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-rose-500"><X size={24}/></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600"><ShieldCheck size={32} /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Order</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Please enter the code sent to <span className="text-slate-900 font-bold">+91 {formData.phone}</span></p>
            </div>
            <div className="space-y-6">
              <input
                type="tel" maxLength={4} value={userEnteredOtp}
                onChange={(e) => setUserEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • •"
                className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
              <button
                onClick={processCodOrder}
                disabled={userEnteredOtp.length !== 4 || isVerifying}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-full hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-900/10"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "Verify & Place Order"}
              </button>
              <p className="text-center text-xs font-bold text-slate-400">
                Didn't receive code? <button onClick={sendOtp} className="text-indigo-600 hover:underline">Resend SMS</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-25 relative z-10">
        <div className="mb-10 flex items-center gap-3">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100"><Lock className="text-emerald-500" size={24} /></div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Secure Checkout</h1>
              <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Fast & Safe Ordering</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handlePayment} className="space-y-8">
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
                  <h2 className="text-xl font-black border-b border-slate-100 pb-5 mb-8 text-slate-900 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">1</span> Shipping Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <input required name="name" onChange={handleChange} value={formData.name} type="text" placeholder="Full Name" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium shadow-sm" />
                    <input required name="email" onChange={handleChange} value={formData.email} type="email" placeholder="Email Address" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium shadow-sm" />
                  </div>
                  <div className="mb-6 flex items-center bg-white border border-slate-200 rounded-2xl focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-bold tracking-tight">+91</div>
                      <input required name="phone" onChange={handleChange} value={formData.phone} type="tel" maxLength={10} placeholder="Mobile Number" className="flex-1 bg-transparent border-none text-slate-900 px-4 py-3.5 font-medium focus:outline-none" />
                  </div>
                  <input required name="address" onChange={handleChange} value={formData.address} type="text" placeholder="House No, Street, Landmark..." className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-6 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium shadow-sm" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <input required name="city" onChange={handleChange} value={formData.city} type="text" placeholder="City" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none transition-all shadow-sm" />
                    <input required name="state" onChange={handleChange} value={formData.state} type="text" placeholder="State" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none transition-all shadow-sm" />
                    <input required name="pincode" onChange={handleChange} value={formData.pincode} type="tel" maxLength={6} placeholder="Pincode" className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 outline-none transition-all tracking-[0.2em] shadow-sm" />
                  </div>
              </div>

              <PaymentSelector 
                paymentMethod={paymentMethod} 
                setPaymentMethod={setPaymentMethod} 
                prepaidDiscount={prepaidDiscountAmount} 
                cartTotal={subtotal} 
              />

              <button type="submit" disabled={loading} className={`w-full text-white font-bold text-lg py-5 rounded-full transition-all flex justify-center items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 ${paymentMethod === "prepaid" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"}`}>
                {loading ? <span className="flex items-center gap-2 animate-pulse"><Sparkles size={20} /> Processing...</span> : <>{paymentMethod === "prepaid" ? "Complete Secure Payment" : "Place COD Order"} • ₹{totalToPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <ArrowRight size={20} /></>}
              </button>
            </form>
          </div>

          {/* 🧾 Order Summary Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 sticky top-32 shadow-sm">
              <h2 className="text-xl font-black mb-8 text-slate-900 flex justify-between items-center">Order Summary <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest">{items.length} Items</span></h2>
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                      <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-white">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 px-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">₹{item.price} per unit</p>
                    </div>
                    <div className="font-black text-sm text-slate-900 shrink-0">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-6 space-y-4 text-sm font-medium text-slate-500">
                <div className="flex justify-between items-center"><span>Subtotal</span><span className="text-slate-900 font-bold">₹{subtotal.toFixed(2)}</span></div>
                {usedDiscount > 0 && <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/50"><span className="flex items-center gap-1.5 font-bold"><Tag size={14} /> Coupon Code ({couponCode})</span><span className="font-black">- ₹{usedDiscount.toFixed(2)}</span></div>}
                {prepaidDiscountAmount > 0 && <div className="flex justify-between items-center text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100/50"><span className="flex items-center gap-1.5 font-bold"><CreditCard size={14} /> Prepaid Savings (10%)</span><span className="font-black">- ₹{prepaidDiscountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between items-center"><span>Delivery Charge</span>{shipping === 0 ? <span className="text-emerald-500 font-black uppercase tracking-wider text-[10px]">Free</span> : <span className="text-slate-900 font-bold">₹{shipping.toFixed(2)}</span>}</div>
                {codHandlingFee > 0 && <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100/50"><span className="flex items-center gap-1.5 font-bold"><ShieldCheck size={14} /> Verification Fee</span><span className="font-black">+ ₹{codHandlingFee.toFixed(2)}</span></div>}
              </div>
              <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter leading-none">₹{totalToPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    {paymentMethod === "prepaid" && <div className="text-[10px] font-black text-emerald-500 mt-2 uppercase tracking-widest bg-emerald-50 inline-block px-2 py-0.5 rounded-md">Saved ₹{prepaidDiscountAmount} today</div>}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}