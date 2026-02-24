"use client";

import { useCartStore } from "@/store/useCartStore";
import { UploadCloud, Check, Sparkles, Loader2, AlertCircle, ShoppingCart, RefreshCw, ShieldCheck, Printer, Droplets } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ⚠️ Note: Moving to signed uploads (/api/upload-signature) is required for backend security.
const CLOUD_NAME = "diudtqcqp";

export default function CustomPage() {
  // 🧠 FIX 8: Get setIsOpen to auto-open cart after adding
  const { addItem, setIsOpen } = useCartStore();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedPackId, setSelectedPackId] = useState(1);

  const packs = [
    { id: 1, qty: 10, price: 249, label: "Starter Pack" },
    { id: 2, qty: 20, price: 399, label: "Value Pack (Save ₹100)" },
    { id: 3, qty: 50, price: 799, label: "Pro Pack (Bulk)" },
  ];

  const selectedPack = packs.find(p => p.id === selectedPackId)!;

  // 🧠 FIX 3: Memory Leak Cleanup (On Unmount)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please upload a valid image file (PNG, JPG).");
    }
    if (file.size > 5 * 1024 * 1024) { 
      return toast.error("File is too large. Max size is 5MB.");
    }

    // 🧠 FIX 3: Immediate cleanup of old object URL before creating a new one
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const objectUrl = URL.createObjectURL(file);

    // 🧠 FIX 5: Advanced Dimension Validation for Print Quality
    const img = new window.Image();
    img.src = objectUrl;
    img.onload = () => {
      if (img.width < 500 || img.height < 500) {
        toast.error("Image resolution is too low for quality printing. (Minimum 500x500px)");
        URL.revokeObjectURL(objectUrl);
        return;
      }
      // If validation passes, set states
      setImageFile(file);
      setPreviewUrl(objectUrl);
      setUploadedUrl(null); 
    };
  };

  const uploadToCloudinary = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    const toastId = toast.loading("Processing your masterpiece securely...");

    try {
      // 🛡️ Step 1: Get the secure signature from our backend
      const sigRes = await fetch('/api/upload-signature', { method: 'POST' });
      if (!sigRes.ok) {
         if (sigRes.status === 429) throw new Error("Too many attempts. Please wait a minute.");
         throw new Error("Could not get upload signature from server.");
      }
      const { signature, timestamp, folder, eager, apiKey } = await sigRes.json();

      // 📦 Step 2: Build FormData EXACTLY matching the signed parameters
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("eager", eager);
      // ❌ REMOVED: formData.append("upload_preset", ...)

      // 🚀 Step 3: Upload directly to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error(`Cloudinary rejected the upload: ${uploadRes.statusText}`);
      
      const data = await uploadRes.json();

      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        toast.success("Design Ready for Printing! 🎉", { id: toastId });
      } else {
        throw new Error("Upload returned no image URL.");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message || "Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setUploadedUrl(null);
  };

  const handleAddToCart = () => {
    if (!uploadedUrl) return toast.error("Please upload and confirm your design first!");

    const customId = `custom-${Date.now()}`;

    addItem({
      id: customId,
      title: `Custom Stickers (Pack of ${selectedPack.qty})`,
      slug: customId, // 🧠 FIX 9: Tiny Optimization
      price: selectedPack.price,
      image: uploadedUrl,
      quantity: 1,
      category: "Custom",
      stock: 999, // Fake frontend stock for now (Backend will handle real capacity)
    });

    toast.success("Custom Pack added to Cart! 🛒");
    resetUpload();
    setIsOpen(true); // 🧠 FIX 8: Auto-open Cart Drawer for better flow
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 selection:bg-indigo-200 font-sans">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: Upload Area */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                <Sparkles className="text-indigo-600" size={14} />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-900">Premium Printing Service</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 leading-[0.95]">
              Create Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">Own Vibe.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed">
              Upload your logo, art, or favorite meme. We turn it into ultra-premium, waterproof vinyl stickers.
            </p>
          </div>

          {/* Upload Box */}
          <div className="relative w-full aspect-square md:aspect-video rounded-[3rem] border-2 border-dashed border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center group">
            
            {!previewUrl && (
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            )}

            {previewUrl ? (
              <div className="relative w-full h-full p-6 flex flex-col items-center justify-center">
                <div className="relative w-full flex-1">
                    <Image src={previewUrl} alt="Preview" fill className="object-contain p-6 drop-shadow-2xl" />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-md z-10">
                     <div className="flex flex-col items-center gap-3">
                         <Loader2 className="animate-spin text-indigo-600" size={40} strokeWidth={2.5} />
                         <span className="text-sm font-bold text-indigo-900">Optimizing Image...</span>
                     </div>
                  </div>
                )}
                {uploadedUrl && !isUploading && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-lg border-2 border-white">
                        <Check size={16} strokeWidth={3}/> Print Ready
                    </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 transition-transform group-hover:scale-110 duration-500">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <UploadCloud size={44} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Drop your design</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Max 5MB (PNG, JPG)</p>
              </div>
            )}
          </div>

          {/* Controls & Confirmation */}
          {previewUrl && !uploadedUrl && !isUploading && (
              <div className="flex gap-4">
                  <button onClick={resetUpload} className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2">
                      <RefreshCw size={16} /> Change
                  </button>
                  <button onClick={uploadToCloudinary} className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                      Confirm & Upload Design
                  </button>
              </div>
          )}

          {uploadedUrl && (
              <button onClick={resetUpload} className="text-sm font-bold text-slate-400 hover:text-rose-500 flex items-center gap-2 transition-colors">
                  <RefreshCw size={14} /> Start over with a new design
              </button>
          )}

          {/* 🧠 FIX 4: UX Psychology Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60">
             <div className="flex flex-col items-center text-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Printer className="text-indigo-500" size={24} />
                <span className="text-xs font-black text-slate-700">300 DPI <br/> HD Print</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck className="text-emerald-500" size={24} />
                <span className="text-xs font-black text-slate-700">Premium <br/> Vinyl Cut</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Droplets className="text-sky-500" size={24} />
                <span className="text-xs font-black text-slate-700">100% <br/> Waterproof</span>
             </div>
          </div>
        </div>

        {/* RIGHT: Pack Selection */}
        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-10 h-fit sticky top-32 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <h2 className="text-2xl font-black mb-8 text-slate-900 flex items-center justify-between">
             Select Pack Size 
             <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">Most Popular</span>
           </h2>

           <div className="space-y-4 mb-10">
             {packs.map((pack) => (
               <div 
                 key={pack.id}
                 onClick={() => setSelectedPackId(pack.id)}
                 className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center group
                   ${selectedPackId === pack.id 
                     ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                     : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                   }`}
               >
                 <div>
                   <h3 className={`font-black text-xl ${selectedPackId === pack.id ? 'text-indigo-700' : 'text-slate-900'}`}>
                     {pack.qty} Stickers
                   </h3>
                   <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${selectedPackId === pack.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {pack.label}
                   </p>
                 </div>
                 <div className="text-right">
                   <div className="text-2xl font-black text-slate-950">₹{pack.price}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">₹{(pack.price / pack.qty).toFixed(1)} each</div>
                 </div>
                 
                 {selectedPackId === pack.id && (
                   <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg border-2 border-white">
                     <Check size={14} strokeWidth={4} />
                   </div>
                 )}
               </div>
             ))}
           </div>

           {/* Total & Action */}
           <div className="border-t border-slate-100 pt-8">
              <div className="flex justify-between items-end mb-8">
                 <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Total Price</span>
                 <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{selectedPack.price}</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isUploading || !uploadedUrl}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95
                  ${isUploading || !uploadedUrl
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-900/10 group'
                  }`}
              >
                {isUploading ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : !uploadedUrl ? (
                  <>Confirm Design First</>
                ) : (
                  <><ShoppingCart size={20} className="group-hover:-translate-y-1 transition-transform" /> Add to Cart</>
                )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}