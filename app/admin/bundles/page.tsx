"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, Package, Check, Loader2, Boxes, ImagePlus, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import slugify from "slugify"; // ✅ FIX 4: Slug generation
// import { createBundle, deleteBundle } from "@/lib/actions"; 

export type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
};

export type Bundle = {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  itemCount: number;
};

export default function AdminBundlesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // ✅ FIX 4: Slug state management
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition(); 

  // Auto-generate slug for bundle
  useEffect(() => {
    if (!isSlugEdited && title) {
      setSlug(slugify(title, { lower: true, strict: true }));
    } else if (!title) {
      setSlug("");
    }
  }, [title, isSlugEdited]);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        // ✅ FIX 7: Backend se hi sirf ACTIVE items aayenge mock data mein
        setProducts([
          { id: "prod_1", title: "Cyberpunk Glitch Sticker", price: 49, image: "/placeholder.png", stock: 100, status: "ACTIVE" },
          { id: "prod_2", title: "JavaScript Logo Pack", price: 99, image: "/placeholder.png", stock: 2, status: "ACTIVE" }, // Low stock
          { id: "prod_3", title: "Holographic Anime Eye", price: 149, image: "/placeholder.png", stock: 0, status: "ACTIVE" }, // Out of stock
        ]);
        setBundles([
          { id: "bun_1", title: "Anime Starter Pack", slug: "anime-starter-pack", price: 199, image: "/placeholder.png", itemCount: 5 },
          { id: "bun_2", title: "Developer Super Combo", slug: "dev-super-combo", price: 399, image: "/placeholder.png", itemCount: 10 },
        ]);
        setLoading(false);
      }, 800);
    };
    fetchData();
  }, []);

  const toggleProduct = (id: string, stock: number) => {
    // ✅ FIX 3: Prevent selection if stock is 0
    if (stock === 0) {
      toast.error("Cannot add out-of-stock item to a bundle! 🚫");
      return;
    }
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteBundle = (id: string, bundleTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the "${bundleTitle}" bundle? This cannot be undone.`)) {
      // ✅ FIX 6: Wrapped delete in startTransition
      startTransition(async () => {
         // await deleteBundle(id);
         await new Promise(res => setTimeout(res, 500));
         toast.success("Bundle deleted successfully! 🗑️");
         setBundles(prev => prev.filter(b => b.id !== id));
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedIds.length < 2) {
      return toast.error("A bundle must contain at least 2 stickers! 📦");
    }

    const formData = new FormData(e.currentTarget);
    const imageUrl = formData.get("image") as string;

    // ✅ FIX 2: Stronger client-side URL validation (Server will still enforce Zod)
    if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
      return toast.error("Please provide a valid secure Cloudinary image URL 🔗");
    }

    // ✅ FIX 5: Capture count BEFORE resetting state to avoid stale closures
    const finalItemCount = selectedIds.length;
    const finalTitle = title;
    const finalSlug = slug;

    startTransition(async () => {
      formData.set("productIds", JSON.stringify(selectedIds));
      formData.set("slug", finalSlug); // Ensure slug is sent
      
      // const res = await createBundle(formData); 

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Bundle Created Successfully! 🎉");
      
      // Reset form safely
      setSelectedIds([]);
      setTitle("");
      setSlug("");
      setIsSlugEdited(false);
      (e.target as HTMLFormElement).reset();
      
      setBundles(prev => [{
        id: `bun_${Date.now()}`,
        title: finalTitle,
        slug: finalSlug,
        price: Number(formData.get("price")),
        image: imageUrl,
        itemCount: finalItemCount // Using captured variable
      }, ...prev]);
    });
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Boxes className="text-indigo-600" size={36} strokeWidth={2.5} />
          Bundle Manager
        </h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">
          Create high-converting sticker combo packs to increase your AOV.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT: FORM */}
        <div className="xl:col-span-1 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-fit">
          <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Create New Combo</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bundle Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} name="title" minLength={3} placeholder="e.g. Hacker Pack" className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300" />
            </div>

            {/* ✅ FIX 4: Slug Input */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">SEO Slug</label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                <span className="bg-slate-100 px-4 py-3.5 text-slate-400 text-sm font-bold border-r border-slate-200 flex items-center">/</span>
                <input required name="slug" type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setIsSlugEdited(true); }} pattern="^[a-z0-9-]+$" title="Only lowercase letters, numbers, and hyphens" className="w-full bg-transparent px-3 py-3.5 focus:outline-none text-indigo-600 font-bold text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Combo Price (₹)</label>
              <input required name="price" type="number" min="1" step="1" placeholder="199" className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-indigo-600 placeholder:text-slate-300" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cover Image URL</label>
              <input required type="url" name="image" placeholder="https://res.cloudinary.com/..." className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-300" />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea required name="description" minLength={10} placeholder="What's included in this pack?" className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 placeholder:text-slate-300 h-24 resize-none custom-scrollbar" />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Select Stickers</label>
                <span className={`px-2 py-0.5 rounded-md text-xs font-black ${selectedIds.length >= 2 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                  {selectedIds.length} Selected (Min 2)
                </span>
              </div>
              
              <div className="h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50 custom-scrollbar space-y-1 relative">
                {loading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 rounded-2xl">
                      <Loader2 className="animate-spin text-indigo-500" size={24} />
                   </div>
                ) : products.length === 0 ? (
                   <div className="text-center text-slate-400 text-sm font-bold p-4 mt-8">No active products found.</div>
                ) : (
                  products.map(product => {
                    // ✅ FIX 3: Out of stock / Low stock awareness
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 5;

                    return (
                      <div 
                        key={product.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'} ${selectedIds.includes(product.id) ? "bg-indigo-100/50 border border-indigo-200" : "hover:bg-white border border-transparent"}`} 
                        onClick={() => !isOutOfStock && toggleProduct(product.id, product.stock)}
                      >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${selectedIds.includes(product.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"}`}>
                              {selectedIds.includes(product.id) && <Check size={14} strokeWidth={3} />}
                          </div>
                          <span className={`text-sm font-bold truncate ${selectedIds.includes(product.id) ? "text-indigo-900" : "text-slate-700"} ${isOutOfStock ? 'line-through' : ''}`}>
                            {product.title}
                          </span>
                          
                          {/* Stock Badges */}
                          {isOutOfStock ? (
                            <span className="ml-auto flex items-center gap-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest shrink-0">
                               Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="ml-auto flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest shrink-0">
                               <AlertTriangle size={10} /> Only {product.stock}
                            </span>
                          ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button disabled={isPending || selectedIds.length < 2} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4">
              {isPending ? <Loader2 size={20} className="animate-spin" /> : <><Package size={20} /> Publish Bundle</>}
            </button>
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] min-h-[500px] flex flex-col">
            <h2 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4 shrink-0">Active Bundles</h2>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                 <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : bundles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Boxes className="text-slate-300" size={32} />
                </div>
                <p className="text-lg font-bold text-slate-900">No bundles yet</p>
                <p className="text-sm font-medium text-slate-500 mt-1">Create your first sticker combo pack from the left panel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
                {bundles.map(bundle => (
                  <div key={bundle.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center group hover:border-indigo-200 hover:shadow-sm transition-all h-24">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                          <Image src={bundle.image} alt={bundle.title} fill className="object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          <ImagePlus size={24} className="text-slate-300 -z-10" />
                        </div>
                        <div className="truncate pr-4">
                          <p className="font-bold text-slate-900 truncate">{bundle.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0">{bundle.itemCount} Items</span>
                            <p className="text-indigo-600 text-sm font-black">₹{bundle.price}</p>
                          </div>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleDeleteBundle(bundle.id, bundle.title)}
                        disabled={isPending}
                        className="shrink-0 p-2.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm disabled:opacity-50"
                     >
                       {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} strokeWidth={2.5} />}
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}