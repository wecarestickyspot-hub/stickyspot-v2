import Link from "next/link";
import Script from "next/script";
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, Heart } from "lucide-react";

export default function Footer() {
  return (
    // 🎨 FIX 3: Luxury Background Separation (Gradient from white to slate-50)
    <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 pt-20 pb-10 text-slate-500 text-sm font-medium">
      
      {/* 🚀 FIX 1 & 2: Upgraded OnlineStore Schema via next/script */}
      <Script
        id="onlinestore-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            name: "StickySpot",
            url: "https://stickyspot.in",
            logo: "https://stickyspot.in/logo.png",
            areaServed: "IN",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Piprali Road",
              addressLocality: "Sikar",
              addressRegion: "Rajasthan",
              postalCode: "332001",
              addressCountry: "IN"
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-99828-20706",
              contactType: "customer service",
              email: "wecarestickyspot@gmail.com"
            },
            sameAs: [
              "https://instagram.com/stickyspot",
              "https://twitter.com/stickyspot",
              "https://facebook.com/stickyspot"
            ]
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 flex items-center group w-fit">
              StickySpot<span className="text-indigo-600 group-hover:text-slate-900 transition-colors">.</span>
            </Link>
            <p className="leading-relaxed max-w-xs text-slate-500">
              Engineered for durability. Designed for expression. Built for India.
              Short. Powerful. Brandable. Premium. <br/>
              Made with ❤️ in India.
            </p>
            <div className="flex gap-4 pt-2">
              {/* ♿ FIX 3: Accessibility (aria-hidden) added to icons */}
              <a href="https://www.instagram.com/sticky_spot_" target="_blank" rel="noopener noreferrer" aria-label="Visit StickySpot Instagram" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:bg-pink-50 hover:text-pink-500 hover:scale-110 transition-all shadow-sm border border-slate-100">
                <Instagram aria-hidden="true" size={18} strokeWidth={2} />
              </a>
              {/* <a href="https://twitter.com/stickyspot" target="_blank" rel="noopener noreferrer" aria-label="Visit StickySpot Twitter" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-500 hover:scale-110 transition-all shadow-sm border border-slate-100">
                <Twitter aria-hidden="true" size={18} strokeWidth={2} />
              </a> */}
              <a href="https://www.facebook.com/Stickyspot01" target="_blank" rel="noopener noreferrer" aria-label="Visit StickySpot Facebook" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all shadow-sm border border-slate-100">
                <Facebook aria-hidden="true" size={18} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-slate-900 font-bold text-base tracking-wide uppercase">Shop</h3>
            {/* 📱 Mobile UX Divider */}
            <div className="h-0.5 w-8 bg-indigo-500 rounded mt-2 mb-6" />
            <ul className="space-y-4">
              <li><Link href="/shop" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">All Stickers</Link></li>
              <li><Link href="/shop?category=Developer" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Developer Pack</Link></li>
              <li><Link href="/shop?category=Anime" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Anime Collection</Link></li>
              <li><Link href="/custom" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Custom Stickers</Link></li>
              <li><Link href="/orders" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Track Order</Link></li>
            </ul>
          </div>

          {/* Column 3: Policy */}
          <div>
            <h3 className="text-slate-900 font-bold text-base tracking-wide uppercase">Policy</h3>
            {/* 📱 Mobile UX Divider */}
            <div className="h-0.5 w-8 bg-indigo-500 rounded mt-2 mb-6" />
            <ul className="space-y-4">
              <li><Link href="/legal/privacy-policy" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-and-conditions" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Terms & Conditions</Link></li>
              <li><Link href="/legal/refund-policy" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Refund & Cancellation</Link></li>
              <li><Link href="/legal/shipping-policy" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Shipping Policy</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-600 hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact (🚨 NAP Consistency Fixed) */}
          <div>
            <h3 className="text-slate-900 font-bold text-base tracking-wide uppercase">Get in Touch</h3>
            {/* 📱 Mobile UX Divider */}
            <div className="h-0.5 w-8 bg-indigo-500 rounded mt-2 mb-6" />
            <ul className="space-y-5">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <MapPin aria-hidden="true" size={16} className="text-indigo-500" />
                </div>
                <span className="mt-1">Piprali Road, Sikar<br/>Rajasthan, India - 332001</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <Mail aria-hidden="true" size={16} className="text-indigo-500" />
                </div>
                <a href="mailto:wecarestickyspot@gmail.com" className="hover:text-indigo-600 mt-1 transition-colors">wecarestickyspot@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 group">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <Phone aria-hidden="true" size={16} className="text-indigo-500" />
                </div>
                <a href="tel:+919982820706" className="hover:text-indigo-600 mt-1 transition-colors">+91 99828 20706</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} StickySpot India. All rights reserved.</p>
          
          {/* Adwik Creators Branding */}
          <a 
            href="https://adwikcreators.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer group shadow-sm"
          >
             Built with <Heart aria-hidden="true" size={12} className="text-rose-500 fill-rose-500 animate-pulse" /> by <span className="group-hover:text-indigo-600 transition-colors">Adwik Creators</span>
          </a>
        </div>

      </div>
    </footer>
  );
}