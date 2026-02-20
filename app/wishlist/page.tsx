import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Sparkles, AlertCircle, AlertTriangle } from "lucide-react";
import WishlistButton from "@/components/shared/WishlistButton";

// 🔐 FIX 4: Explicit Dynamic Strategy (Ensures this route is NEVER statically cached)
export const dynamic = "force-dynamic";

// 📦 FIX 5: SEO Metadata
export const metadata = {
  title: "My Wishlist | StickySpot",
  description: "View and manage your saved favorite premium stickers.",
};

export default async function WishlistPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let wishlistItems: any[] = [];
  let dbError = false;

  try {
    // ⚡ FIX 1: Optimized Thin Query (No Overfetching)
    wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { 
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: true,
            category: true,
            status: true // Good to check if product is still active
          }
        } 
      },
    });

    // Optional: Filter out inactive products from displaying
    wishlistItems = wishlistItems.filter(item => item.product.status === "ACTIVE");

  } catch (error) {
    console.error("Wishlist fetch error:", error);
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative overflow-x-hidden">

      {/* 🔮 Background Polish */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 mb-4 shadow-sm">
                <Heart size={14} className="text-pink-500 fill-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">Saved for Later</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                My <span className="text-pink-500">Wishlist</span>
            </h1>
            {!dbError && (
              <p className="text-slate-500 font-medium mt-2">
                  You have <span className="text-slate-900 font-bold">{wishlistItems.length} items</span> saved in your collection.
              </p>
            )}
          </div>
          
          {wishlistItems.length > 0 && !dbError && (
              <Link href="/shop" className="group flex items-center gap-2 text-sm font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors" aria-label="Continue Shopping">
                  Continue Shopping <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
          )}
        </div>

        {dbError ? (
           <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-rose-100 rounded-[3rem] shadow-sm animate-in zoom-in duration-700">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
                  <AlertTriangle size={32} className="text-rose-500" strokeWidth={2} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-2">Could not load wishlist</h2>
               <p className="text-slate-500 font-medium">We're having trouble reaching the database. Please try refreshing.</p>
           </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-100 rounded-[3rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] animate-in zoom-in duration-700">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Heart size={40} className="text-slate-200" strokeWidth={1.5} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 mb-3">Your wishlist is lonely</h2>
             <p className="text-slate-500 font-medium mb-10 max-w-xs mx-auto">Add your favorite stickers here and grab them whenever you're ready!</p>
             <Link href="/shop" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 hover:scale-105 transition-all shadow-lg shadow-slate-900/10 active:scale-95 flex items-center gap-2" aria-label="Explore the Store">
                <Sparkles size={20} /> Explore the Store
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item, idx) => {
              // 🛡️ FIX 2: Safe Image Fallback
              const imageSrc = item.product?.images?.[0] ?? "/placeholder.png";

              return (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-5 hover:border-pink-200 transition-all hover:shadow-[0_20px_50px_-20px_rgba(244,114,182,0.15)] group relative flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-700 fill-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  
                  {/* Remove/Wishlist Button */}
                  <div className="absolute top-6 right-6 z-20">
                      <WishlistButton 
                          productId={item.productId} 
                          isWishlisted={true} 
                          isLoggedIn={true} 
                      />
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 bg-slate-50 border border-slate-50 p-4">
                    <Image
                      src={imageSrc}
                      alt={item.product.title}
                      fill
                      // ⚡ FIX 3: Image Optimization Sizes Prop
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-110 transition duration-700 ease-out"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-2">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {item.product.category}
                          </span>
                      </div>
                      <Link href={`/product/${item.product.slug}`} aria-label={`View ${item.product.title}`}>
                          <h3 className="font-black text-xl text-slate-900 mb-2 line-clamp-1 group-hover:text-pink-500 transition-colors leading-tight">
                              {item.product.title}
                          </h3>
                      </Link>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between mt-4 px-2 pb-2">
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Price</span>
                          {/* 🎨 FIX UI 1: Price Formatting */}
                          <span className="text-2xl font-black text-slate-950">₹{Number(item.product.price).toLocaleString("en-IN")}</span>
                      </div>
                      <Link 
                          href={`/product/${item.product.slug}`} 
                          aria-label={`Buy ${item.product.title}`}
                          className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 active:scale-90 hover:scale-105"
                      >
                          <ShoppingBag size={20} strokeWidth={2.5} />
                      </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}