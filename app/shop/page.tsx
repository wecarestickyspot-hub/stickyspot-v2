import ProductCard from "@/components/shop/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopShippingBar from "@/components/shop/ShopShippingBar";
import { BundleCard } from "@/components/shop/BundleCard";
import Pagination from "@/components/shared/Pagination";
import BackToTop from "@/components/shared/BackToTop"; // 🆕 new component (see below)
import { prisma } from "@/lib/prisma";
import {
  PackageOpen,
  Sparkles,
  Layers,
  BadgeCheck,
  Package,
  Zap,
  SearchX,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}>;

// ─────────────────────────────────────────────────────────────
// ✅ FIX 1: force-dynamic — naya product add karo, turant dikhega
// Pehle revalidate=3600 tha — 1 hour tak naya product nahi dikhta tha
// ─────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: { searchParams: SearchParams }
): Promise<Metadata> {
  const { category, search, page } = await props.searchParams;
  const currentPage = parseInt(page || "1");

  let title = "Premium Sticker Collection | StickySpot";
  let description =
    "India ke best waterproof vinyl stickers. Bikes, Anime, Motivation, Rajasthan Pride — free shipping above ₹199. COD available.";

  if (search) {
    title = `"${search}" ke stickers | StickySpot`;
    description = `"${search}" ke liye ${title} results. Waterproof, premium quality.`;
  } else if (category && category !== "All") {
    title = `${category} Stickers | StickySpot India`;
    description = `Best ${category} stickers India mein. Waterproof vinyl, premium quality. COD available.`;
  }

  if (currentPage > 1) title = `Page ${currentPage} | ${title}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://stickyspot.in/shop${
        category && category !== "All" ? `?category=${category}` : ""
      }`,
    },
    openGraph: {
      title,
      description,
      url: "https://stickyspot.in/shop",
      siteName: "StickySpot India",
      images: [{ url: "https://stickyspot.in/og-shop.png", width: 1200, height: 630 }],
    },
    robots: {
      index: currentPage === 1,
      follow: true,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// POPULAR CATEGORIES — empty state mein suggest karo
// ─────────────────────────────────────────────────────────────
const POPULAR_CATEGORIES = [
  { label: "🏍️ Bikes & Cars", value: "Bikes" },
  { label: "🎌 Anime", value: "Anime" },
  { label: "💪 Motivation", value: "Motivation" },
  { label: "😂 Funny & Memes", value: "Funny" },
  { label: "🏜️ Rajasthan Pride", value: "Rajasthan" },
];

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default async function ShopPage(props: { searchParams: SearchParams }) {
  const { category, search, sort, page = "1" } = await props.searchParams;

  const currentPage = Math.max(1, parseInt(page) || 1);
  const limit = 24;
  const skip = (currentPage - 1) * limit;

  // ✅ FIX 2: Strict Prisma types — no more `any`
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    stock: { gt: 0 },
  };

  if (category && category !== "All") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case "price_asc":  return { price: "asc" };
      case "price_desc": return { price: "desc" };
      case "popular":    return { wishlistItems: { _count: "desc" } };
      default:           return { createdAt: "desc" };
    }
  })();

  const showBundles =
    !search && (!category || category === "All") && currentPage === 1;

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
        _count: { select: { wishlistItems: true } },
      },
    }),
    prisma.product.count({ where }),

    showBundles
      ? prisma.bundle.findMany({
          where: { isActive: true },
          include: {
            products: {
              include: {
                product: {
                  select: { images: true, stock: true, price: true, id: true },
                },
              },
            },
          },
        })
      : Promise.resolve([]),

    prisma.product.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
    }),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);
  const categoriesList = ["All", ...categoriesData.map((c) => c.category)];

  // ─── JSON-LD structured data for Google ───
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "StickySpot Sticker Collection",
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: skip + index + 1,
      url: `https://stickyspot.in/product/${p.slug}`,
      name: p.title,
    })),
  };

  const isFiltered = !!(search || (category && category !== "All"));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans relative">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Shipping Bar */}
      <div className="relative z-20 pt-16 lg:pt-8">
        <ShopShippingBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 relative z-10">

        {/* ─── HEADER ─── */}
        <div className="text-center mb-6 lg:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap size={12} className="fill-indigo-600" /> Premium Collection 2026
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-2 sm:mb-6">
            The Sticker{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-600 to-purple-600">
              Shop
            </span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {search ? (
              <>
                <span className="text-slate-900 font-black">{totalProducts}</span>{" "}
                results for &ldquo;{search}&rdquo;
              </>
            ) : category && category !== "All" ? (
              <>
                <span className="text-slate-900 font-black">{totalProducts}</span>{" "}
                {category} stickers — waterproof &amp; premium
              </>
            ) : (
              "Discover waterproof stickers designed for every adventure."
            )}
          </p>

          {/* 🆕 Active filter pill */}
          {isFiltered && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
              <Filter size={12} />
              {search ? `Search: "${search}"` : `Category: ${category}`}
              <Link
                href="/shop"
                className="ml-1 text-red-400 hover:text-red-600 font-black transition-colors"
              >
                ✕ Clear
              </Link>
            </div>
          )}
        </div>

        {/* ─── BUNDLES ─── */}
        {bundles.length > 0 && (
          <section className="mb-12 lg:mb-24 animate-in fade-in duration-700 delay-100">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <Package size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight italic">
                  Exclusive Bundles
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Best value packs — save more, stick more
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle as any} />
              ))}
            </div>
          </section>
        )}

        {/* ─── SHOP LAYOUT ─── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-36 z-30">
            <ShopFilters categories={categoriesList} />

            {/* 🆕 Product count badge in sidebar */}
            <div className="mt-4 hidden lg:flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <TrendingUp size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600">
                <span className="text-slate-900">{totalProducts}</span> products{" "}
                {isFiltered ? "found" : "available"}
              </span>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full min-h-[60vh]">

            {/* 🆕 Mobile product count */}
            <div className="flex lg:hidden items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500">
                <span className="text-slate-900 font-black">{totalProducts}</span>{" "}
                products
                {isFiltered && " found"}
              </span>
              {currentPage > 1 && (
                <span className="text-xs font-bold text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {products.length === 0 ? (
              // ─── EMPTY STATE ───
              <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center bg-white border border-slate-100 rounded-3xl lg:rounded-[3rem] shadow-sm animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                  <SearchX size={36} className="text-slate-300" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900">
                  {search ? `"${search}" nahi mila` : "Koi product nahi mila"}
                </h2>
                <p className="text-sm lg:text-base text-slate-500 mt-2 max-w-xs mx-auto font-medium">
                  {search
                    ? "Spelling check karo ya koi aur keyword try karo"
                    : "Is category mein abhi koi product nahi hai"}
                </p>

                {/* 🆕 Popular category suggestions in empty state */}
                <div className="mt-8">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Popular Categories Try Karo
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.value}
                        href={`/shop?category=${cat.value}`}
                        className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  Sab Products Dekho
                </Link>
              </div>
            ) : (
              <>
                {/* ─── PRODUCT GRID ─── */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {products.map((product, idx) => (
                    <div
                      key={product.id}
                      className="animate-in fade-in slide-in-from-bottom-6 duration-500 fill-both"
                      style={{ animationDelay: `${(idx % 8) * 40}ms` }}
                    >
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        slug={product.slug}
                        price={product.price}
                        // ✅ FIX 3: Cloudinary URL optimize — w_400 for cards (was w_1200)
                        image={
                          product.images?.[0]
                            ? product.images[0].replace(
                                /\/upload\//,
                                "/upload/f_auto,q_auto:good,w_400,c_limit/"
                              )
                            : "/placeholder.png"
                        }
                        category={product.category}
                        stock={product.stock}
                        createdAt={product.createdAt.toISOString()}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination totalPages={totalPages} currentPage={currentPage} />

                {/* 🆕 Page info */}
                {totalPages > 1 && (
                  <p className="text-center text-xs text-slate-400 font-medium mt-4">
                    {skip + 1}–{Math.min(skip + limit, totalProducts)} of{" "}
                    {totalProducts} products
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── USP FEATURES ─── */}
        <div className="mt-20 sm:mt-32 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-slate-100 pt-16 sm:pt-20">
          {[
            {
              icon: <BadgeCheck className="text-emerald-500" size={28} />,
              title: "Industrial Grade",
              desc: "Long-lasting vinyl",
            },
            {
              icon: <Sparkles className="text-sky-500" size={28} />,
              title: "Ultra Vibrant",
              desc: "UV resistant inks",
            },
            {
              icon: <Layers className="text-purple-500" size={28} />,
              title: "Easy Peel",
              desc: "Zero residue left",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-50 shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                {feature.icon}
              </div>
              <p className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                {feature.title}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 🆕 WhatsApp CTA Banner */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-green-500/20">
          <div className="text-white text-center sm:text-left">
            <p className="font-black text-xl sm:text-2xl">Custom Sticker Chahiye? 🎨</p>
            <p className="text-green-100 text-sm font-medium mt-1">
              WhatsApp karo — design share karo, 24 hrs mein ready
            </p>
          </div>
          <a
            href="https://wa.me/919982820706?text=Hi%2C%20mujhe%20custom%20sticker%20order%20karna%20hai"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-8 py-4 bg-white text-green-600 font-black rounded-2xl hover:bg-green-50 transition-all active:scale-95 text-sm shadow-lg"
          >
            WhatsApp Now →
          </a>
        </div>
      </div>

      {/* 🆕 Back to Top Button */}
      <BackToTop />
    </div>
  );
}