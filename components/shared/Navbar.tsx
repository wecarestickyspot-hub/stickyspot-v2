"use client";

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, LayoutDashboard, X, Package, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState, useRef, useMemo } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import SearchInput from '@/components/shared/SearchInput'; 

export default function Navbar() {
  const { user } = useUser();
  const { items, setIsOpen } = useCartStore();

  // 🛡️ FIX 1: Secure Admin Detection using Metadata (RBAC) instead of hardcoded email
  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⚡ FIX 2: Memoize cart item calculation for performance
  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  // Handle body scroll locking
  useEffect(() => {
    if (isMobileMenuOpen || showSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen, showSearch]);

  // Handle ESC key and Outside clicks for Search & Mobile Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showSearch && searchRef.current && !searchRef.current.contains(target)) {
        setShowSearch(false);
      }
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // 🛡️ FIX 4: Close both on Esc
        setShowSearch(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showSearch, isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 w-full z-50 border-b border-white/40 bg-white/40 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 🛡️ FIX 6: Safer layout without fragile absolute positioning */}
          <div className="flex justify-between items-center h-20 gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center z-20">
              <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 group drop-shadow-sm">
                StickySpot<span className="text-indigo-600 group-hover:text-slate-900 transition-colors">.</span>
              </Link>
            </div>

            {/* MIDDLE SECTION (Dynamic Flex) */}
            <div className="flex-1 flex justify-center z-10 px-2 lg:px-8">
              {showSearch ? (
                <div 
                  ref={searchRef}
                  className="w-full max-w-xl flex items-center gap-2 sm:gap-3 relative animate-in fade-in zoom-in duration-200"
                >
                  <div className="flex-1">
                     <SearchInput />
                  </div>
                  <button 
                    type="button" 
                    aria-label="Close search" // 🛡️ FIX 3: a11y
                    onClick={() => setShowSearch(false)}
                    className="shrink-0 text-slate-400 hover:text-rose-600 transition-colors bg-white/50 p-2.5 rounded-full backdrop-blur-sm border border-slate-200 shadow-sm hover:bg-rose-50 hover:border-rose-200"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex space-x-8 lg:space-x-10 items-center text-sm font-bold text-slate-600">
                  <Link href="/shop" className="hover:text-indigo-600 transition-colors">Latest Drops</Link>
                  <Link href="/custom" className="hover:text-indigo-600 transition-colors">Create Custom</Link>
                  <Link href="/shop?category=All" className="hover:text-indigo-600 transition-colors">Shop All</Link>

                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full text-slate-800 hover:bg-white/80 hover:text-indigo-600 transition-all border border-white/60 shadow-sm">
                      <LayoutDashboard size={16} /> <span>Admin</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center space-x-1 sm:space-x-3 text-slate-500 z-20">
              {!showSearch && (
                <button 
                  onClick={() => setShowSearch(true)} 
                  aria-label="Open search" // 🛡️ FIX 3: a11y
                  className="hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-white/40"
                >
                  <Search size={22} strokeWidth={2} />
                </button>
              )}

              <SignedIn>
                <Link href="/orders" aria-label="My Orders" className="hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-white/40 hidden sm:block">
                  <Package size={22} strokeWidth={2} />
                </Link>
                <Link href="/wishlist" aria-label="My Wishlist" className="hover:text-pink-500 transition-colors p-2 rounded-full hover:bg-white/40 hidden sm:block">
                   <Heart size={22} strokeWidth={2} />
                </Link>
              </SignedIn>

              <div className="flex items-center px-1">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button aria-label="Sign in" className="hover:text-indigo-600 p-2 transition-colors rounded-full hover:bg-white/40">
                      <User size={22} strokeWidth={2} />
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="p-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>

              {/* CART BUTTON */}
              <button 
                onClick={() => setIsOpen(true)}
                aria-label={`Open cart with ${totalItems} items`} // 🛡️ FIX 3: a11y
                className="relative group p-2 rounded-full hover:bg-white/40 transition-all duration-300 ease-in-out" 
              >
                <ShoppingBag 
                  size={22} 
                  strokeWidth={2}
                  className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300" 
                />
                
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-sm border border-white/50 transform translate-x-1/4 -translate-y-1/4 group-hover:bg-indigo-700 transition-colors">
                    {totalItems}
                  </span>
                )}
              </button>

              {!showSearch && (
                <button 
                  onClick={toggleMobileMenu}
                  aria-expanded={isMobileMenuOpen} // 🛡️ FIX 3: a11y
                  aria-label="Toggle mobile menu"
                  className="md:hidden hover:text-indigo-600 p-2 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Menu size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          <div 
            ref={mobileMenuRef}
            className="fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-white/70 backdrop-blur-2xl border-t border-white/60 z-50 md:hidden animate-in slide-in-from-top-4 duration-400 shadow-[0_30px_60px_rgba(0,0,0,0.1)] overflow-y-auto rounded-b-[2.5rem]"
          >
            <div className="flex flex-col h-full p-6 space-y-6 pt-8">
              <div className="flex flex-col space-y-3 text-base font-bold text-slate-700 flex-1">
                
                <Link href="/shop" onClick={closeMobileMenu} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/40 hover:bg-white/80 hover:text-indigo-600 transition-all group border border-white/50 shadow-sm">
                  <ShoppingBag size={22} className="text-slate-500 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                  <span>Latest Drops</span>
                </Link>

                <Link href="/custom" onClick={closeMobileMenu} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/40 hover:bg-white/80 hover:text-indigo-600 transition-all group border border-white/50 shadow-sm">
                  <Package size={22} className="text-slate-500 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                  <span>Create Custom</span>
                </Link>

                <SignedIn>
                  <Link href="/orders" onClick={closeMobileMenu} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/40 hover:bg-white/80 hover:text-indigo-600 transition-all group border border-white/50 shadow-sm">
                    <Package size={22} className="text-slate-500 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                    <span>My Orders</span>
                  </Link>
                  <Link href="/wishlist" onClick={closeMobileMenu} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/40 hover:bg-white/80 hover:text-pink-600 transition-all group border border-white/50 shadow-sm">
                    <Heart size={22} className="text-slate-500 group-hover:text-pink-500 group-hover:scale-110 transition-all" />
                    <span>My Wishlist</span>
                  </Link>
                </SignedIn>

                <Link href="/shop?category=All" onClick={closeMobileMenu} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/40 hover:bg-white/80 hover:text-indigo-600 transition-all group border border-white/50 shadow-sm">
                  <ShoppingBag size={22} className="text-slate-500 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                  <span>Shop All</span>
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={closeMobileMenu} className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl bg-indigo-600/90 backdrop-blur-md text-white hover:bg-indigo-700 transition-all group shadow-lg shadow-indigo-600/20 border border-indigo-500/50">
                    <LayoutDashboard size={22} />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/60 rounded-full text-slate-700 hover:text-slate-900 transition-all font-bold shadow-sm"
              >
                <X size={20} />
                <span>Close Menu</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}