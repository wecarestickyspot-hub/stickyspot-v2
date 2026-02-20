import ProductCard from "@/components/shop/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters"; 
import ShopShippingBar from "@/components/shop/ShopShippingBar";
import { BundleCard } from "@/components/shop/BundleCard";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { PackageOpen, Sparkles, Layers, ChevronLeft, ChevronRight, BadgeCheck, Package, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}>;

// ⚡ SPEED: Revalidate har 1 ghante mein (Cache strategy)
export const revalidate = 3600; 

// 🛡️ FIX: Dynamic SEO Metadata
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
      index: currentPage === 1, // 🚨 Do NOT index page 2, 3, etc.
      follow: true
    }
  };
}

export default async function ShopPage(props: { searchParams: SearchParams }) {
  const { category, search, sort, page = "1" } = await props.searchParams;
  
  const currentPage = parseInt(page);
  const limit = 24; 
  const skip = (currentPage - 1) * limit;

  // 1. Build Query (Optimized)
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
      { category: { contains: search, mode: "insensitive" } }, // Changed tags to category for safety if tags missing
    ];
  }

  // 2. Sorting Logic
  const orderBy: any = {};
  switch (sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "popular": orderBy.wishlistItems = { _count: "desc" }; break;
    default: orderBy.createdAt = "desc";
  }

  // 3. 🔥 THIN QUERY FETCH (With Fix)
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
    
    // 🚨 PRISMA FIX: Nested Include for Join Table
    (!search && (!category || category === "All") && currentPage === 1) ? prisma.bundle.findMany({
      where: { isActive: true },
      include: { 
        products: { 
          include: { // 👈 Pehle Join Table mein ghusenge
             product: { // 👈 Phir asli Product table mein
               select: { images: true } 
             }
          }
        } 
      }
    }) : Promise.resolve([]),

    // Optimized Category Fetching
    prisma.product.groupBy({
      by: ['category'],
      where: { status: "ACTIVE" },
    })
  ]);

  const totalPages = Math.ceil(totalProducts / limit);
  const categoriesList = ["All", ...categoriesData.map((c) => c.category)];

  // 4. User Auth & Wishlist
  const user = await currentUser();
  let userWishlistIds: string[] = [];
  const userData = user ? { id: user.id, firstName: user.firstName, imageUrl: user.imageUrl } : undefined;

  if (user && products.length > 0) {
    const productIdsOnPage = products.map(p => p.id);
    const wishlistItems = await prisma.wishlist.findMany({
      where: { 
        userId: user.id,
        productId: { in: productIdsOnPage }
      },
      select: { productId: true }
    });
    userWishlistIds = wishlistItems.map(item => item.productId);
  }

  // 5. Structured Data for Google
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

      <div className="relative z-20 pt-24 lg:pt-8">
        <ShopShippingBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* 🏷️ Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap size={12} className="fill-indigo-600" /> Premium Collection 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6">
            The Sticker <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600">Shop</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {search 
              ? <>Found <span className="text-slate-900 font-black">{totalProducts}</span> results for "{search}"</>
              : "Discover industrial-grade waterproof stickers designed to stick through every adventure."}
          </p>
        </div>

        {/* 🎁 BUNDLES SECTION */}
        {bundles.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <Package size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Exclusive Bundles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle as any} />
              ))}
            </div>
          </section>
        )}

        {/* 🎛️ SHOP LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-36 z-30">
            <ShopFilters categories={categoriesList} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full min-h-[60vh]">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm animate-in zoom-in duration-500">
                <PackageOpen size={64} className="text-slate-200 mb-6" />
                <h2 className="text-3xl font-black text-slate-900">Sold Out or Not Found</h2>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Try adjusting your filters or search terms to find your next favorite sticker.</p>
                <Link href="/shop" className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all active:scale-95">
                  View All Products
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
                        currentUser={userData}
                        isWishlisted={userWishlistIds.includes(product.id)}
                        stock={product.stock}
                        createdAt={product.createdAt}
                      />
                    </div>
                  ))}
                </div>

                {/* 🎯 PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-24">
                    <Link
                      href={`/shop?${new URLSearchParams({ category: category || '', search: search || '', sort: sort || '', page: Math.max(1, currentPage - 1).toString() })}`}
                      className={`h-14 px-6 rounded-2xl font-black flex items-center gap-2 border transition-all ${currentPage === 1 ? 'opacity-30 pointer-events-none border-slate-100 bg-slate-50 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                    >
                      <ChevronLeft size={20} strokeWidth={3} /> <span className="hidden sm:inline">PREV</span>
                    </Link>

                    <div className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black flex items-center shadow-lg shadow-slate-200">
                      {currentPage} <span className="mx-2 opacity-30">/</span> {totalPages}
                    </div>

                    <Link
                      href={`/shop?${new URLSearchParams({ category: category || '', search: search || '', sort: sort || '', page: Math.min(totalPages, currentPage + 1).toString() })}`}
                      className={`h-14 px-6 rounded-2xl font-black flex items-center gap-2 border transition-all ${currentPage === totalPages ? 'opacity-30 pointer-events-none border-slate-100 bg-slate-50 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'}`}
                    >
                      <span className="hidden sm:inline">NEXT</span> <ChevronRight size={20} strokeWidth={3} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 🏆 USP Features */}
        <div className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-slate-100 pt-20">
          {[
            { icon: <BadgeCheck className="text-emerald-500" />, title: "Industrial Grade", desc: "Long-lasting vinyl" },
            { icon: <Sparkles className="text-sky-500" />, title: "Ultra Vibrant", desc: "UV resistant inks" },
            { icon: <Layers className="text-purple-500" />, title: "Easy Peel", desc: "Zero residue left" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                  {feature.icon}
              </div>
              <p className="font-black text-slate-900 text-xl tracking-tight">{feature.title}</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}