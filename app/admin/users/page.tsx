import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Users as UsersIcon, ShieldCheck, Mail, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
import RoleSelect from "@/components/admin/RoleSelect";

// ✅ FIX: Admin pages should never be cached
export const dynamic = "force-dynamic";
const ITEMS_PER_PAGE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page } = await searchParams;
  
  // 1. Fresh User Data Fetch
  const user = await currentUser();
  const userRole = user?.publicMetadata?.role as string;

  // 🛡️ 2. Security Check (FAANG Level)
  // ✅ FIX: No hardcoded email. Using Env variable and Optional Chaining
  const adminEmail = process.env.ADMIN_EMAIL; 
  const isOwner = user?.emailAddresses?.[0]?.emailAddress === adminEmail;
  
  if (userRole !== "SUPER_ADMIN" && !isOwner) {
    redirect("/admin");
  }

  // 📄 3. Pagination & Query Logic
  const query = search || "";
  const rawPage = Number(page);
  const currentPage = (!rawPage || isNaN(rawPage) || rawPage < 1) ? 1 : rawPage;

  const client = await clerkClient();

  // 4. Fetch Users with Pagination support
  const users = await client.users.getUserList({
    query: query,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  const totalCount = users.totalCount;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UsersIcon className="text-indigo-600" size={36} strokeWidth={2.5} />
            Team & Users
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Manage administrative permissions for <span className="font-bold text-indigo-600">{totalCount}</span> registered users.
          </p>
        </div>

        {/* Search Bar */}
        <form className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
          <input 
            name="search"
            placeholder="Search by name or email..." 
            defaultValue={query}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Identity</th>
                <th className="px-6 py-5">Email Address</th>
                <th className="px-6 py-5">Current Permissions</th>
                <th className="px-6 py-5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.data.map((u) => {
                const role = (u.publicMetadata.role as string) || "USER";
                const isMe = u.id === user?.id;
                
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* User Profile */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 flex-shrink-0">
                          <Image src={u.imageUrl} alt={u.firstName || "User"} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.firstName} {u.lastName}
                            {isMe && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">You</span>}
                          </span>
                          {/* ✅ FIX: Masking User ID for higher security awareness */}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: ***{u.id.slice(-4)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {u.emailAddresses[0]?.emailAddress || "No Email"}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${
                        role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        role === 'SUPPORT' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        <ShieldCheck size={12} strokeWidth={2.5} />
                        {role}
                      </div>
                    </td>

                    {/* Action Select */}
                    <td className="px-6 py-5 text-right">
                      {!isMe ? (
                        <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <RoleSelect userId={u.id} currentRole={role} />
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic pr-4">Self Record</span>
                      )}
                    </td>

                  </tr>
                )
              })}

              {users.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                            <UserIcon size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-xl font-black text-slate-900 mb-1">No members found</p>
                        <p className="text-sm font-medium text-slate-500">Refine your search to find a specific team member.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ FIX: Pagination UI Added */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 gap-4 mt-4">
          <p className="text-sm font-bold text-slate-500">
            Showing <span className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of <span className="text-slate-900">{totalCount}</span>
          </p>

          <div className="flex gap-2">
            <Link
              href={currentPage > 1 ? `/admin/users?page=${currentPage - 1}${query ? `&search=${encodeURIComponent(query)}` : ""}` : "#"}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage > 1 ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronLeft size={16} strokeWidth={3} /> Prev
            </Link>
            
            <Link
              href={currentPage < totalPages ? `/admin/users?page=${currentPage + 1}${query ? `&search=${encodeURIComponent(query)}` : ""}` : "#"}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
                currentPage < totalPages ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600" : "bg-transparent border-slate-100 text-slate-300 cursor-not-allowed pointer-events-none"
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