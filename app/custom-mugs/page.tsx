"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { useCartStore } from "@/store/useCartStore";
import { ImagePlus, UploadCloud, CheckCircle2, ShieldCheck, Zap, Truck, Star, ArrowRight, Paintbrush } from "lucide-react";
import CldImage from "@/components/shared/CldImage";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CustomMugPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addItem, setIsOpen } = useCartStore();
  const router = useRouter();

  // 🛒 Add to Cart Logic for Custom Product
  const handleAddToCart = () => {
    if (!uploadedImage) {
      toast.error("Pehle apni photo upload karein! 📸");
      return;
    }

    // Generate a unique ID for this specific custom order
    const customId = `custom-mug-${Date.now()}`;

    addItem({
      id: customId,
      title: "Premium Custom Photo Mug",
      slug: customId,        // 👈 NAYA: TypeScript ki error fix karne ke liye
      category: "Custom",    // 👈 NAYA: Checkout page ko batane ke liye
      price: 299,
      image: uploadedImage, // Customer ki photo cart mein dikhegi!
      quantity: 1,
      stock: 100, // Unlimited
    });

    toast.success("Custom Mug added to cart! 🎉");
    setIsOpen(true); // Open the cart drawer
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 font-sans pt-24 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── BREADCRUMB ─── */}
        <nav aria-label="Breadcrumb" className="mb-8 hidden sm:block">
          <ol className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-indigo-600">Custom Gifts</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* ─── LEFT: LIVE 3D PREVIEW ─── */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-slate-100 bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center relative group">
              
              {/* The Blank White Mug Background */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                {/* Aap yahan apne blank mug ki image URL daal sakte hain */}
                <div className="w-3/4 h-3/4 bg-[url('https://res.cloudinary.com/demo/image/upload/v1690000000/blank_mug_placeholder.jpg')] bg-contain bg-center bg-no-repeat opacity-20" />
              </div>

              {/* 🚀 THE CSS MAGIC: Image Overlay with Multiply Blend */}
              <div className="relative w-[60%] h-[60%] flex items-center justify-center z-10 transition-all duration-500">
                {uploadedImage ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 mix-blend-multiply transform rotate-2">
                    <CldImage
                      src={uploadedImage}
                      alt="Your Custom Mug Design"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="text-center animate-pulse">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <ImagePlus size={40} className="text-indigo-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Your Photo Here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">HD Print</span>
            </div>
          </div>

          {/* ─── RIGHT: CONTROLS & CHECKOUT ─── */}
          <div className="lg:col-span-6 flex flex-col justify-center pt-2">
            
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-6">
              <Paintbrush size={14} /> Personalize It
            </div>

            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-[1.1] text-slate-900">
              Custom Photo Mug
            </h1>
            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
              Upload your favorite memory, and we'll print it on a premium ceramic mug. Perfect for gifting or your morning coffee vibe.
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">₹299</span>
              <span className="text-xl text-slate-400 font-bold line-through">₹499</span>
            </div>

            {/* 📸 CLOUDINARY UPLOAD BUTTON */}
            <div className="mb-8">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{ 
                  maxFiles: 1, 
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  maxFileSize: 10000000, // 10MB High Quality allowed
                  sources: ['local', 'camera', 'instagram', 'google_drive']
                }}
                onOpen={() => setIsUploading(true)}
                onClose={() => setIsUploading(false)}
                onSuccess={(result: any) => {
                  setUploadedImage(result.info.secure_url);
                  toast.success("Photo uploaded successfully! Check the preview.");
                }}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${
                      uploadedImage 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10'
                    }`}
                  >
                    {uploadedImage ? (
                      <><CheckCircle2 size={24} /> Photo Uploaded - Change Photo</>
                    ) : (
                      <><UploadCloud size={24} /> Upload High-Quality Photo</>
                    )}
                  </button>
                )}
              </CldUploadWidget>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                JPG, PNG up to 10MB supported.
              </p>
            </div>

            {/* 🛒 ADD TO CART BUTTON */}
            <button
              onClick={handleAddToCart}
              disabled={!uploadedImage}
              className={`w-full font-black text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl ${
                !uploadedImage 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-slate-900/20'
              }`}
            >
              {uploadedImage ? "Add Custom Mug to Cart" : "Upload Photo to Continue"} 
              <ArrowRight size={20} className={uploadedImage ? "group-hover:translate-x-1 transition-transform" : ""} />
            </button>

            {/* 🛡️ TRUST BADGES */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Zap className="text-amber-500 shrink-0" size={24} />
                <div>
                  <p className="font-black text-slate-900 text-xs">Fast Print</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dispatched in 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                <div>
                  <p className="font-black text-slate-900 text-xs">Microwave Safe</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Ceramic</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Truck className="text-indigo-500 shrink-0" size={24} />
                <div>
                  <p className="font-black text-slate-900 text-xs">Safe Delivery</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thermocol Box</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}