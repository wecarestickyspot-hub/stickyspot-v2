import AddToCartButton from '@/components/shop/AddToCartButton';
import Reviews from "@/components/product/Reviews";
import WishlistButton from "@/components/shared/WishlistButton";
import DeliveryChecker from '@/components/product/DeliveryChecker';
import ProductDescription from '@/components/product/ProductDescription'; 
import { Star, Truck, ShieldCheck, Zap, AlertCircle, Sparkles, History, Layers, ChevronRight, Home, Tags } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { currentUser } from "@clerk/nextjs/server";
import LiveTryOn from "@/components/product/LiveTryOn";
import CldImage from '@/components/shared/CldImage';
import { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" } 
  });

  if (!product) return { title: "Product Not Found" };

  const cleanDescription = product.description.replace(/<[^>]+>/g, '').replace(/\uFFFD/g, ' ').slice(0, 160);

  return {
    title: `${product.title} | Premium Waterproof Sticker | StickySpot`,
    description: `${cleanDescription}... Shop premium vinyl stickers at StickySpot. Free shipping over ₹499.`,
    alternates: {
      canonical: `https://stickyspot.in/product/${slug}`,
    },
    openGraph: {
      title: product.title,
      description: cleanDescription,
      images: [{ url: product.images?.[0] || "/placeholder.png" }],
      type: 'article',
    },
  };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug: slug, status: "ACTIVE" }, 
    include: {
      reviews: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!product) return null;

  const reviewStats = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: true
  });

  return { ...product, reviewStats };
}

async function getRelatedProducts(category: string, currentProductId: string) {
  return await prisma.product.findMany({
    where: {
      category: category,
      id: { not: currentProductId },
      status: "ACTIVE",
    },
    take: 4,
    orderBy: { createdAt: "desc" }, 
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      images: true,
      category: true,
      stock: true,
      createdAt: true,
    }
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const productData = await getProduct(slug);
  const user = await currentUser();

  if (!productData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center font-sans pt-20">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-lg">
          <AlertCircle className="text-rose-500 w-16 h-16 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-3 italic">Sticker Not Found</h1>
          <p className="text-slate-500 mb-6 font-medium">This sticker might be out of stock or removed.</p>
          <Link href="/shop" className="inline-block px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const userData = user ? { id: user.id, firstName: user.firstName || "Customer", imageUrl: user.imageUrl } : null;
  const relatedProducts = await getRelatedProducts(productData.category, productData.id);

  let userWishlistIds: string[] = [];
  if (user) {
    const productIdsToCheck = [productData.id, ...relatedProducts.map(p => p.id)];
    const wishlistRecords = await prisma.wishlist.findMany({
      where: {
        userId: user.id,
        productId: { in: productIdsToCheck }
      },
      select: { productId: true }
    });
    userWishlistIds = wishlistRecords.map(w => w.productId);
  }

  const isWishlisted = userWishlistIds.includes(productData.id);

  const totalReviews = productData.reviewStats._count;
  const averageRating = productData.reviewStats._avg.rating ? productData.reviewStats._avg.rating.toFixed(1) : "0";
  const mainImage = productData.images?.[0] || "/placeholder.png";
  const isLowStock = productData.stock > 0 && productData.stock <= 10;
  
  const isNew = productData.createdAt ? (new Date().getTime() - new Date(productData.createdAt).getTime()) < (14 * 24 * 60 * 60 * 1000) : false;

  const displayDescription = productData.description.replace(/\uFFFD/g, " • ");

  const hasDiscount = productData.originalPrice && productData.originalPrice > productData.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((Number(productData.originalPrice) - Number(productData.price)) / Number(productData.originalPrice)) * 100) 
    : 0;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.title,
    "image": productData.images,
    "description": productData.description,
    "brand": { "@type": "Brand", "name": "StickySpot" },
    "offers": {
      "@type": "Offer",
      "url": `https://stickyspot.in/product/${productData.slug}`,
      "priceCurrency": "INR",
      "price": productData.price,
      "availability": productData.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": totalReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": totalReviews
    } : undefined
  };

  // 🚀 BEST PRACTICE FIX: Strictly sanitized object for Client Components
  const safeProductForCart = {
    id: String(productData.id),
    title: productData.title,
    price: Number(productData.price),
    images: Array.isArray(productData.images) ? productData.images : [],
    slug: productData.slug,
    stock: Number(productData.stock),
    category: String(productData.category),
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-25 relative z-10">

        <nav aria-label="Breadcrumb" className="mb-6 hidden sm:flex">
          <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <li><Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1"><Home size={12} /> Home</Link></li>
            <li><ChevronRight size={12} /></li>
            <li><Link href={`/shop?category=${productData.category}`} className="hover:text-indigo-600 transition-colors">{productData.category}</Link></li>
            <li><ChevronRight size={12} /></li>
            <li className="text-slate-900 truncate max-w-[200px]" aria-current="page">{productData.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* 🖼️ IMAGE SECTION */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 relative aspect-square rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden border border-slate-100 bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center group">
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="relative w-full h-full flex items-center justify-center">
                <CldImage 
                  src={mainImage} 
                  alt={productData.title} 
                  fill 
                  className="object-contain p-6 sm:p-10 group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-2xl" 
                  priority 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>
            
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-1 hover:scale-110 transition-transform cursor-pointer">
                <WishlistButton productId={productData.id} isWishlisted={isWishlisted} isLoggedIn={!!user} />
              </div>
            </div>
          </div>

          {/* 📝 DETAILS SECTION */}
          <div className="lg:col-span-6 flex flex-col justify-center pt-2 lg:pt-10">
            
            {/* Categories & Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Link href={`/shop?category=${productData.category}`} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm hover:bg-slate-900 transition-colors">
                {productData.category}
              </Link>
              
              {isNew && (
                <span className="bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                   NEW DROP
                </span>
              )}

              <a href="#reviews" className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className={s <= Math.round(Number(averageRating)) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />)}
                </div>
                <span className="text-slate-900 text-[10px] font-black tracking-widest">{totalReviews > 0 ? `${averageRating} / 5` : "0 Reviews"}</span>
              </a>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.15] text-slate-900">{productData.title}</h1>

            <div className="flex items-center gap-3 sm:gap-4 mb-8 border-b border-slate-100 pb-6 flex-wrap">
              <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter">₹{Number(productData.price).toLocaleString("en-IN")}</span>
              
              {hasDiscount && (
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl text-slate-400 font-bold line-through decoration-slate-300 decoration-2">
                    ₹{Number(productData.originalPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 uppercase tracking-widest shadow-sm">
                    <Tags size={14} className="fill-emerald-600" /> {discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>


            {/* Urgency & Stock */}
            <div className="mb-8">
              {productData.stock > 0 ? (
                isLowStock ? <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest animate-pulse"><Zap size={16} className="fill-rose-600" /> Only {productData.stock} left!</div>
                : <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest"><Sparkles size={16} className="fill-emerald-600" /> Waterproof & Premium</div>
              ) : <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-500 px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest">Out of Stock</div>}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-10">
              {/* 🚀 FIX: Passed strictly sanitized object */}
              <AddToCartButton product={safeProductForCart} />
              <LiveTryOn imageSrc={mainImage} />
            </div>

            <DeliveryChecker />

              <ProductDescription description={displayDescription} />
            {/* Trust Seals */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8">
              <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-[2rem] border border-slate-50 shadow-sm">
                <Layers className="text-indigo-600 shrink-0" size={24} />
                <div><p className="font-black text-slate-900 text-xs sm:text-sm">Weatherproof</p><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">UV & Rain safe</p></div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-[2rem] border border-slate-50 shadow-sm">
                <History className="text-indigo-600 shrink-0" size={24} />
                <div><p className="font-black text-slate-900 text-xs sm:text-sm">No Residue</p><p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Safe removal</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* ⭐ Reviews Section */}
        <div id="reviews" className="mt-24 sm:mt-32 pt-16 sm:pt-20 border-t border-slate-200/60">
          <Reviews
            productId={productData.id}
            productSlug={productData.slug}
            reviews={productData.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toString() }))}
            currentUser={userData}
          />
        </div>

        {/* 📦 You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-20 pt-16 sm:pt-20 border-t border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
                  <Sparkles className="text-indigo-600" size={24} /> You May Also Like
                </h2>
                <p className="text-slate-500 font-medium mt-1 sm:mt-2 text-sm sm:text-base">Explore more premium stickers in the <span className="text-indigo-600 font-bold">{productData.category}</span> collection.</p>
              </div>
              <Link
                href={`/shop?category=${productData.category}`}
                className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest hover:text-indigo-600 bg-white border border-slate-200 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard
                    id={p.id}
                    title={p.title}
                    slug={p.slug}
                    price={p.price}
                    image={p.images?.[0] || "/placeholder.png"}
                    category={p.category}
                    stock={p.stock}
                    // 🚀 FIX: Prevent serialization error for Date object in ProductCard
                    createdAt={p.createdAt.toISOString()} 
                    currentUser={userData}
                    isWishlisted={userWishlistIds.includes(p.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}