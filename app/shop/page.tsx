import ProductCard from "@/components/shop/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters"; 
import ShopShippingBar from "@/components/shop/ShopShippingBar";
import { BundleCard } from "@/components/shop/BundleCard";
import { prisma } from "@/lib/prisma";
import { PackageOpen, Sparkles, Layers, ChevronLeft, ChevronRight, BadgeCheck, Package, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}>;

export const revalidate = 3600; 

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const { category, search, page } = await props.searchParams;
  const currentPage = parseInt(page || "1");

  let title = "Premium Sticker Collection | StickySpot";
  if (search) title = `Search results for "${search}" | StickySpot`;
  else if (category && category !== "All") title = `${category} Stickers | StickySpot`;

  if (currentPage > 1) title = `Page ${currentPage} | ${title}`;

  return {
    title,
    description: "Explore waterproof vinyl stickers and exclusive bundles. Optimized for quality and speed.",
    alternates: {
      canonical: `https://stickyspot.in/shop${category && category !== 'All' ? `?category=${category}` : ''}`
    },
    robots: {
      index: currentPage === 1,
      follow: true
    }
  };
}

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const { category, search, sort, page = "1" } = await props.searchParams;
  
  const currentPage = parseInt(page);
  const limit = 24; 
  const skip = (currentPage - 1) * limit;

  const where: any = { 
    status: "ACTIVE",
    stock: { gt: 0 } 
  };

  if (category && category !== "All") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any = {};
  switch (sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "popular": orderBy.wishlistItems = { _count: "desc" }; break;
    default: orderBy.createdAt = "desc";
  }

  // 🚀 CLEAN & FAST: Removed currentUser and slow queries from here
  const [products, totalProducts, bundles, categoriesData] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        images: true, 
        category: true,
        stock: true,
        createdAt: true,
        _count: { select: { wishlistItems: true } }
      }
    }),
    prisma.product.count({ where }),
    
    (!search && (!category || category === "All") && currentPage === 1) ? prisma.bundle.findMany({
      where: { isActive: true },
      include: { 
        products: { 
          include: { 
             product: { 
               select: { images: true } 
             }
          }
        } 
      }
    }) : Promise.resolve([]),

    prisma.product.groupBy({
      by: ['category'],
      where: { status: "ACTIVE" },
    })
  ]);

  const totalPages = Math.ceil(totalProducts / limit);
  const categoriesList = ["All", ...categoriesData.map((c) => c.category)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://stickyspot.in/product/${p.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 🚀 FIX: Reduced top padding on mobile (pt-24 to pt-16) */}
      <div className="relative z-20 pt-16 lg:pt-8">
        <ShopShippingBar />
      </div>

      {/* 🚀 FIX: Reduced top padding (py-12 to py-6 lg:py-12) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 relative z-10">
        
        {/* 🏷️ Header */}
        <div className="text-center mb-6 lg:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap size={12} className="fill-indigo-600" /> Premium Collection 2026
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-2 sm:mb-6">
            The Sticker <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600">Shop</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {search 
              ? <>Found <span className="text-slate-900 font-black">{totalProducts}</span> results for "{search}"</>
              : "Discover waterproof stickers designed for every adventure."}
          </p>
        </div>

        {/* 🎁 BUNDLES SECTION */}
        {bundles.length > 0 && (
          <section className="mb-12 lg:mb-24">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <Package size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight italic">Exclusive Bundles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle as any} />
              ))}
            </div>
          </section>
        )}

        {/* 🎛️ SHOP LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-36 z-30">
            <ShopFilters categories={categoriesList} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full min-h-[60vh]">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center bg-white border border-slate-100 rounded-3xl lg:rounded-[3rem] shadow-sm animate-in zoom-in duration-500">
                <PackageOpen size={48} className="text-slate-200 mb-4 lg:mb-6 lg:w-16 lg:h-16" />
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Sold Out or Not Found</h2>
                <p className="text-sm lg:text-base text-slate-500 mt-2 max-w-xs mx-auto font-medium">Try adjusting your filters or search terms.</p>
                <Link href="/shop" className="mt-6 lg:mt-8 px-6 lg:px-8 py-3 lg:py-4 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:bg-indigo-600 transition-all active:scale-95">
                  View All Products
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {products.map((product, idx) => (
                    <div 
                        key={product.id} 
                        className="animate-in fade-in slide-in-from-bottom-10 duration-700 fill-both"
                        style={{ animationDelay: `${(idx % 8) * 50}ms` }}
                    >
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        slug={product.slug}
                        price={product.price}
                        image={product.images?.[0] ?? "/placeholder.png"}
                        category={product.category}
                        stock={product.stock}
                        // 🚀 NAYA FIX: ISO String Taki error na aaye aur Client Component theek se padhe
                        createdAt={product.createdAt.toISOString()}
                        // Yaha 'hideWishlist' pass NAHI kar rahe, toh iska matlab Wishlist ka icon is page par dikhega!
                      />
                    </div>
                  ))}
                </div>

                {/* 🎯 PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mt-16 sm:mt-24">
                    <Link
                      href={`/shop?${new URLSearchParams({ category: category || '', search: search || '', sort: sort || '', page: Math.max(1, currentPage - 1).toString() })}`}
                      className={`h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black flex items-center gap-1 sm:gap-2 border transition-all ${currentPage === 1 ? 'opacity-30 pointer-events-none border-slate-100 bg-slate-50 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                    >
                      <ChevronLeft size={18} strokeWidth={3} /> <span className="hidden sm:inline">PREV</span>
                    </Link>

                    <div className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black flex items-center shadow-lg shadow-slate-200 text-sm sm:text-base">
                      {currentPage} <span className="mx-2 opacity-30">/</span> {totalPages}
                    </div>

                    <Link
                      href={`/shop?${new URLSearchParams({ category: category || '', search: search || '', sort: sort || '', page: Math.min(totalPages, currentPage + 1).toString() })}`}
                      className={`h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black flex items-center gap-1 sm:gap-2 border transition-all ${currentPage === totalPages ? 'opacity-30 pointer-events-none border-slate-100 bg-slate-50 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                    >
                      <span className="hidden sm:inline">NEXT</span> <ChevronRight size={18} strokeWidth={3} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 🏆 USP Features */}
        <div className="mt-20 sm:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-slate-100 pt-16 sm:pt-20">
          {[
            { icon: <BadgeCheck className="text-emerald-500" />, title: "Industrial Grade", desc: "Long-lasting vinyl" },
            { icon: <Sparkles className="text-sky-500" />, title: "Ultra Vibrant", desc: "UV resistant inks" },
            { icon: <Layers className="text-purple-500" />, title: "Easy Peel", desc: "Zero residue left" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-50 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                  {feature.icon}
              </div>
              <p className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{feature.title}</p>
              <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}