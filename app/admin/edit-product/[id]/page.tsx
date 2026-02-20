import EditProductForm from "@/components/admin/EditProductForm"; 
import { prisma } from "@/lib/prisma"; 
import { ArrowLeft, Edit3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation"; 
import { currentUser } from "@clerk/nextjs/server"; 
import { z } from "zod";

// ✅ Prevent Cache Issues on Admin Pages
export const dynamic = "force-dynamic";

// 🛡️ Strong ID Validation Schema
const idSchema = z.string().cuid();

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Next.js 15 Way: params is a promise
  const { id } = await params; 

  // 1. Validate ID before hitting DB (Security Fix)
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    notFound(); // Invalid CUID format? Seedha 404.
  }

  // 2. Admin Guard (Fallback to Env/Clerk until DB roles are implemented)
  const user = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!user || user.emailAddresses[0]?.emailAddress !== adminEmail) {
    redirect("/"); // Kick out non-admins instantly
  }
  
  // 3. Optimized DB Fetch (No overfetching + future soft-delete ready)
  const product = await prisma.product.findUnique({
    where: { 
      id: parsedId.data, // 👈 Zod se verified ID use ki hai
      // isDeleted: false // 👈 Future proofing for soft deletes
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      originalPrice: true,
      stock: true,
      category: true,
      status: true,
      images: true,
    }
  });

  // 🚫 Native Next.js 404 routing
  if (!product) {
    notFound(); 
  }

  // Edit UI (Navbar removed, handled by layout.tsx)
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-3 bg-white border border-slate-200 text-slate-400 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Edit3 className="text-indigo-600" size={32} /> Edit Product
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Updating details for: <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{product.title}</span>
            </p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-sm">
          <AlertCircle size={14} strokeWidth={2.5} /> ADMIN MODE
        </div>
      </div>

      {/* Form Component */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-both">
        <EditProductForm product={product} />
      </div>

    </div>
  );
}