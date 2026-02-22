"use client";

import { updateProduct } from "@/lib/actions"; 
import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect, useTransition, useRef } from "react";
import { ImagePlus, Save, X, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 
import slugify from "slugify";

// ✅ PRO-LEVEL: Strict TypeScript Interface
export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  category: string;
  status: string;
  images: string[];
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter(); 
  const [images, setImages] = useState<string[]>(product.images || []);
  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isPending, startTransition] = useTransition(); 

  const formRef = useRef<HTMLFormElement>(null);

  // Auto-slug generation during edit if not manually touched
  useEffect(() => {
    if (!isSlugEdited && title !== product.title) {
      setSlug(slugify(title, { lower: true, strict: true }));
    }
  }, [title, isSlugEdited, product.title]);

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const updateWithId = updateProduct.bind(null, product.id);

  const clientAction = async (formData: FormData) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image! 📸");
      return;
    }

    startTransition(async () => {
      try {
        // Safe-guard images array before sending
        formData.set("images", JSON.stringify(images));
        
        // Ensure slug is synced with state before sending
        formData.set("slug", slug);

        const result = await updateWithId(formData);

        if (result?.success) {
          toast.success(result.message || "Product Updated Successfully! 🎉");
          // 🚀 THE MAGIC FIX: Pushes user back to the exact page they came from (e.g., Page 2)
          router.back(); 
        } else {
          // Displaying structured server errors if any
          toast.error(result?.message || "Failed to update product.");
        }
      } catch (error) {
        console.error("Update failed on client:", error);
        toast.error("A critical error occurred while saving.");
      }
    });
  };

  return (
    <form ref={formRef} action={clientAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN */}
      <div className="lg:col-span-2 space-y-8">
        
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900">Basic Information</h3>
            {product.status === "ARCHIVED" && (
               <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Archived Product</span>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Product Title</label>
            <input 
              required 
              name="title" 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              maxLength={100}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-300" 
            />
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
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setIsSlugEdited(true);
                }}
                maxLength={50}
                className="w-full bg-transparent px-3 py-3.5 focus:outline-none text-indigo-600 font-bold text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</label>
            <textarea 
              required 
              name="description" 
              rows={5} 
              defaultValue={product.description} 
              maxLength={2000}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium placeholder:text-slate-300 resize-none custom-scrollbar" 
            />
          </div>
        </div>

        {/* GALLERY */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Product Gallery</h3>
          
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{ 
                multiple: true, 
                maxFiles: 5, 
                maxFileSize: 2000000, 
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"] 
            }}
            onSuccess={(result: any) => {
              const newUrl = result.info.secure_url;
              setImages((prev) => prev.includes(newUrl) ? prev : [...prev, newUrl]);
            }}
          >
            {({ open }) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => !isPending && open()} 
                  className={`aspect-square border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center transition-all group ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'}`}
                >
                  <ImagePlus size={32} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" strokeWidth={1.5} />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Add Image</span>
                </div>
                
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50 p-2">
                    <Image src={img} alt={`Product ${idx+1}`} fill sizes="200px" className="object-contain p-2" />
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
            )}
          </CldUploadWidget>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-8">
        
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">Organization</h3>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
            <select name="status" defaultValue={product.status} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer">
              <option value="ACTIVE">🟢 Active (Live)</option>
              <option value="DRAFT">🟡 Draft (Hidden)</option>
              <option value="ARCHIVED">🔴 Archived</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
            <select name="category" defaultValue={product.category} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer">
              {/* Add or fetch dynamic categories as needed */}
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
              <input required min="1" max="100000" step="1" name="price" type="number" defaultValue={product.price} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-indigo-600 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">MRP (₹)</label>
              <input name="originalPrice" min="1" max="100000" step="1" type="number" defaultValue={product.originalPrice || ""} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold line-through" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Stock Quantity</label>
            <input required min="0" max="100000" step="1" name="stock" type="number" defaultValue={product.stock} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
        >
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
          {isPending ? "Saving Changes..." : "Update Product"}
        </button>
      </div>
    </form>
  );
}