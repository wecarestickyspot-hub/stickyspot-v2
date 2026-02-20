"use client";

import Navbar from "@/components/shared/Navbar";
import { createProduct } from "@/lib/actions"; 
import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect, useTransition } from "react";
import { ImagePlus, Save, ArrowLeft, X, Loader2, AlertCircle, PackagePlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import slugify from "slugify";

export default function AddProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ✅ PRO-LEVEL UX: Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title || images.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, images]);

  // ✅ FAANG Level: Better Slug Generation
  useEffect(() => {
    if (!isSlugEdited && title) {
      setSlug(slugify(title, { lower: true, strict: true }));
    } else if (!title) {
      setSlug("");
    }
  }, [title, isSlugEdited]);

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const clientAction = (formData: FormData) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image! 📸");
      return;
    }

    startTransition(async () => {
      formData.set("images", JSON.stringify(images));
      
      const result = await createProduct(formData);
      
      if (result?.success) {
        toast.success(result.message || "Product Created Successfully! 🎉");
        // Disable warning before redirecting
        window.onbeforeunload = null; 
        router.push("/admin/products"); 
      } else {
        toast.error(result?.message || "Failed to create product.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-3 bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <PackagePlus className="text-indigo-600" size={32} /> Add New Product
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Create a new premium sticker listing for your store.</p>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-sm">
            <AlertCircle size={14} strokeWidth={2.5} /> ADMIN MODE
          </div>
        </div>

        <form action={clientAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
              <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Basic Information</h3>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Product Title</label>
                <input required name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cyberpunk Glitch Sticker" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300" />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">SEO Slug (URL)</label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <span className="bg-slate-100 px-4 py-3.5 text-slate-400 text-sm font-bold border-r border-slate-200 flex items-center">/product/</span>
                  <input 
                    required 
                    name="slug" 
                    type="text" 
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugEdited(true);
                    }}
                    pattern="^[a-z0-9-]+$" 
                    title="Only lowercase letters, numbers, and hyphens"
                    className="w-full bg-transparent px-3 py-3.5 focus:outline-none text-indigo-600 font-bold text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
                <textarea required name="description" rows={5} placeholder="Describe the sticker quality, material, and vibe..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-300 resize-none custom-scrollbar" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Product Gallery</h3>
              
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{ multiple: true, maxFiles: 5, maxFileSize: 2000000, clientAllowedFormats: ["jpg", "jpeg", "png", "webp"] }} 
                onSuccess={(result: any) => {
                  // ✅ FIX: Prevent Duplicate Images
                  const newUrl = result.info.secure_url;
                  setImages((prev) => prev.includes(newUrl) ? prev : [...prev, newUrl]);
                }}
              >
                {({ open }) => {
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div 
                        onClick={() => !isPending && open()}
                        className={`aspect-square border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center transition-all group ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'}`}
                      >
                        <ImagePlus size={32} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" strokeWidth={1.5} />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Upload Image</span>
                      </div>

                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50 p-2">
                          <Image src={img} alt="Product" fill className="object-contain p-2" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-2 right-2 bg-white text-rose-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 border border-slate-100"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                }}
              </CldUploadWidget>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Organization</h3>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
                <select name="status" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer">
                  <option value="ACTIVE">🟢 Active (Live)</option>
                  <option value="DRAFT">🟡 Draft (Hidden)</option>
                  <option value="ARCHIVED">🔴 Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer">
                  <option value="Holo">Holographic</option>
                  <option value="Dev">Developer</option>
                  <option value="Anime">Anime</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Art">Art</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Pricing & Stock</h3>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sale Price (₹)</label>
                  <input required min="1" step="1" name="price" type="number" placeholder="99" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-indigo-600 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Original Price (₹)</label>
                  <input name="originalPrice" min="1" step="1" type="number" placeholder="149" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold line-through" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Stock Quantity</label>
                <input required min="0" step="1" name="stock" type="number" defaultValue={50} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
              {isPending ? "Saving Product..." : "Publish Product"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}