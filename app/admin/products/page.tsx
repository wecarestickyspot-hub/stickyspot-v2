import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, ChevronLeft, ChevronRight, PackageX, FileSpreadsheet, PackageSearch } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import AdminSearch from "@/components/admin/AdminSearch"; // ✅ Naya Search Component

export const dynamic = "force-dynamic";
const ITEMS_PER_PAGE = 10;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const user = await currentUser();
  if (!user || user.emailAddresses[0]?.emailAddress !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const { page, query } = await searchParams;
  const rawPage = Number(page);
  let currentPage = (!rawPage || isNaN(rawPage) || rawPage < 1) ? 1 : rawPage;
  
  const searchQuery = query || "";
  const encodedQuery = encodeURIComponent(searchQuery);

  const whereCondition = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" as const } },
          { category: { contains: searchQuery, mode: "insensitive" as const } },
        ],
      }
    : {
        status: { not: "ARCHIVED" } 
      };

  const totalProducts = await prisma.product.count({ where: whereCondition });
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  if (currentPage > totalPages && totalPages > 0) {
    redirect(`/admin/products?page=${totalPages}${searchQuery ? `&query=${encodedQuery}` : ""}`);
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    select: {
      id: true,
      title: true,
      category: true,
      price: true,
      stock: true,
      images: true,
      status: true,
    }
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PackageSearch className="text-indigo-600" size={36} strokeWidth={2.5} />
            Products Inventory
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Manage your catalog. Total <span className="font-bold text-indigo-600">{totalProducts}</span> products.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* 🚀 FIXED: Advanced Instant Search (Debounced + Clear Button) */}
          <AdminSearch />

          <Link 
            href="/admin/products/bulk" 
            className="bg-white border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
          >
            <FileSpreadsheet size={18} strokeWidth={2.5} /> 
            <span>Bulk Import</span>
          </Link>

          <Link 
            href="/admin/add-product" 
            className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} strokeWidth={2.5} /> <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* --- PRODUCTS TABLE --- */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Image</th>
                <th className="px-6 py-5">Product Details</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Stock & Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors group ${product.status === 'ARCHIVED' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm p-1.5 flex-shrink-0">
                        <Image 
                          src={product.images?.[0] ?? "/placeholder.png"} 
                          alt={product.title} 
                          fill 
                          className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{product.title}</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider uppercase">ID: {product.id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black tracking-widest uppercase text-indigo-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-lg">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : product.stock < 10 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                            Low: {product.stock}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">
                            In Stock: {product.stock}
                          </span>
                        )}
                        {product.status !== "ACTIVE" && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 border-l-2 border-slate-200">
                            {product.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/edit-product/${product.id}`}
                          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                        >
                          <Edit size={16} strokeWidth={2.5} />
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <PackageX size={32} className="text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-xl font-black text-slate-900 mb-1">No products found</p>
                      <p className="text-sm font-medium text-slate-500 mb-6">
                        {searchQuery ? `Couldn't find any match for "${searchQuery}"` : "Try adding your first product."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4 mt-4">
          <p className="text-sm font-bold text-slate-500">
            Showing <span className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}</span> of <span className="text-slate-900">{totalProducts}</span>
          </p>

          <div className="flex gap-2">
            <Link
              href={currentPage > 1 ? `/admin/products?page=${currentPage - 1}${searchQuery ? `&query=${encodedQuery}` : ""}` : "#"}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage > 1 
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" 
                  : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronLeft size={16} strokeWidth={3} /> Prev
            </Link>
            
            <Link
              href={currentPage < totalPages ? `/admin/products?page=${currentPage + 1}${searchQuery ? `&query=${encodedQuery}` : ""}` : "#"}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage < totalPages 
                  ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" 
                  : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              Next <ChevronRight size={16} strokeWidth={3} />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}