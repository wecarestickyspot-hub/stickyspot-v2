import ProductCard from "@/components/shop/ProductCard";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Star, Truck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import CldImage from '@/components/shared/CldImage';

export const metadata = {
  title: "Buy Premium Vinyl Stickers Online in India | StickySpot",
  description: "Premium waterproof vinyl stickers for laptops & creators. Built to outlast trends. Fast shipping across India. Shop StickySpot today.",
  alternates: {
    canonical: "https://stickyspot.in"
  },
  openGraph: {
    title: "Buy Premium Vinyl Stickers Online in India | StickySpot",
    description: "Premium waterproof vinyl stickers for laptops & creators. Fast shipping across India.",
    url: "https://stickyspot.in",
    siteName: "StickySpot",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "StickySpot Premium Stickers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Premium Vinyl Stickers Online in India | StickySpot",
    description: "Premium waterproof vinyl stickers for laptops & creators. Fast shipping across India.",
    images: ["/og-image.jpg"],
  },
};

export const revalidate = 60; 

type MinimalProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  category: any; 
  stock: number;
  createdAt: Date;
};

export default async function HomePage() {
  
  let latestProducts: MinimalProduct[] = [];
  let heroImage = "/placeholder.png"; 
  let userWishlistIds: string[] = [];
  let user;

  try {
    const [productsData, settingsData, currentUserData] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          images: true,
          category: true,
          stock: true,
          createdAt: true
        }
      }),
      prisma.storeSettings.findUnique({
        where: { id: "global_settings" }
      }),
      currentUser()
    ]);

    latestProducts = productsData as MinimalProduct[]; 
    
    if (settingsData?.heroImage) heroImage = settingsData.heroImage;
    user = currentUserData;

    if (user && latestProducts.length > 0) {
      const productIds = latestProducts.map(p => p.id);
      const wishlistItems = await prisma.wishlist.findMany({
        where: {
          userId: user.id,
          productId: { in: productIds }
        },
        select: { productId: true }
      });
      userWishlistIds = wishlistItems.map(item => item.productId);
    }

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error fetching homepage data:", error);
    }
  }

  const userData = user ? {
    id: user.id,
    firstName: user.firstName ?? "User",
    imageUrl: user.imageUrl ?? ""
  } : undefined;

  return (
    <div className="min-h-screen text-slate-900 selection:bg-indigo-200 overflow-x-hidden font-sans relative">
      
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-40 -right-32 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl -z-10" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 pb-16 lg:pt-12 lg:pb-20 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* LEFT: Text Content */}
            <div className="flex-1 text-center lg:text-left animate-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-900">
                  New Collection Drop
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-6 text-slate-900 leading-[0.95] drop-shadow-sm">
                Stick Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
                  Vibe Anywhere.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto lg:mx-0 mb-8 font-medium leading-relaxed">
                Premium waterproof stickers that survive real life — not just your desk. Built to outlast trends. Designed to express yours.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/shop" className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 text-base">
                  Shop Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/custom" className="px-8 py-4 bg-white/40 backdrop-blur-xl border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-white/70 transition-all text-base shadow-sm">
                  Custom Order
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500"/> 1,000+ Happy Customers</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-indigo-500"/> Fast Shipping India 🇮🇳</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500"/> 100% Waterproof</span>
              </div>
            </div>

            {/* RIGHT: Hero Image */}
            <div className="flex-1 relative w-full max-w-xl lg:max-w-none animate-in fade-in zoom-in duration-1000 delay-200">
              <div className="relative p-2.5 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] group">
                <div className="relative h-[350px] lg:h-[500px] w-full rounded-[2.5rem] overflow-hidden bg-slate-100">
                  <CldImage
                    src={heroImage}
                    alt="Premium Laptop Stickers"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- BUSINESS STRATEGY BANNER --- */}
      <div className="bg-slate-900 py-4 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center sm:justify-between items-center gap-4 text-white text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Cash on Delivery Available</div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-400" /> Safe & Secure Payments</div>
          <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Dispatch in 24 Hours</div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      {/* 🚀 PRO FIX: py-10 for tighter mobile spacing */}
      <section className="py-10 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 mb-2 lg:mb-3">Why Choose StickySpot?</h2>
            <p className="text-slate-600 text-sm lg:text-base max-w-xl mx-auto font-medium">We engineer durable art for your expensive gear.</p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 lg:gap-8 pb-6 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            {[
              // 🚀 PRO FIX: Crisp, short copy for ultra-fast reading
              { icon: <Zap className="text-indigo-600" size={24} />, title: "Pro Vinyl", desc: "Premium 6mil matte vinyl. Scratch-resistant.", bg: "bg-indigo-50/60" },
              { icon: <ShieldCheck className="text-emerald-600" size={24} />, title: "Weatherproof", desc: "Rain, sun, or dishwasher. Stays vibrant for years.", bg: "bg-emerald-50/60" },
              { icon: <Sparkles className="text-pink-600" size={24} />, title: "Clean Peel", desc: "Upgrade anytime without sticky mess. 100% residue-free.", bg: "bg-pink-50/60" }
            ].map((item, i) => (
              // 🚀 PRO FIX: p-5 md:p-8 for 15-20% height reduction on mobile
              <div key={i} className="snap-center shrink-0 w-[85%] sm:w-[300px] md:w-auto relative p-5 md:p-8 rounded-3xl lg:rounded-[2rem] bg-white/50 backdrop-blur-xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:bg-white hover:-translate-y-1 transition-all duration-500 text-left group overflow-hidden">
                {/* 🚀 PRO FIX: Reduced icon bottom margin mb-3 */}
                <div className={`mb-3 lg:mb-5 p-3 lg:p-4 ${item.bg} w-fit rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-white shadow-sm`}>
                  {item.icon}
                </div>
                <h3 className="text-lg lg:text-xl font-black mb-1 lg:mb-2 text-slate-900">{item.title}</h3>
                {/* 🚀 PRO FIX: Ultra Smart Trick (line-clamp-2 + leading-snug) */}
                <p className="text-slate-600 text-xs lg:text-sm font-medium leading-snug line-clamp-2 lg:line-clamp-none">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LATEST DROPS --- */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-200 pb-8">
          <div>
            <p className="text-indigo-600 font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
                Loved by Developers & Creators Across India 🇮🇳
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Latest Drops</h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-6 py-3 rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            View Full Catalog
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {latestProducts.length > 0 ? (
            latestProducts.map((product) => (
              <div key={product.id} className="group h-full relative">
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
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <p className="text-slate-500 font-medium text-base">New collection dropping soon. Stay tuned! ⚡</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}