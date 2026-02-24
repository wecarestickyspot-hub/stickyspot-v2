import type { Metadata } from "next";
import Link from "next/link";
import { Truck, MapPin, Phone, Mail, Package, Clock, AlertCircle } from "lucide-react";

// 🎯 1️⃣ Advanced SEO & Metadata (OG + Canonical)
export const metadata: Metadata = {
  title: "Shipping Policy | StickySpot India",
  description: "Learn about StickySpot's shipping times, delivery rates, and order tracking. Enjoy free shipping on sticker orders over ₹499 across India.",
  openGraph: {
    title: "Shipping Policy | StickySpot India",
    description: "Fast & reliable sticker delivery across India. Free shipping on orders above ₹499.",
    url: "https://stickyspot.in/legal/shipping-policy",
    siteName: "StickySpot",
    type: "website",
  },
  alternates: {
    canonical: "https://stickyspot.in/legal/shipping-policy",
  },
};

export default function ShippingPolicyPage() {
  // ⚙️ 2️⃣ Dynamic Date (Future-Proof)
  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-20 relative overflow-hidden z-0">
      
      {/* 🎨 3️⃣ Subtle Luxury Background Decoration */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-96 bg-indigo-300 blur-[120px] opacity-20 -z-10 rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Document Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 relative z-10">
          
          {/* Header */}
          <div className="mb-10 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="p-4 bg-indigo-50 rounded-2xl inline-flex w-fit">
              {/* ♿ 4️⃣ Accessibility (aria-hidden) */}
              <Truck aria-hidden="true" className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Shipping Policy
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-600 leading-relaxed text-base sm:text-lg">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Fast & Reliable Delivery</h2>
              <p className="mb-4">
                At StickySpot, we know you are excited to get your hands on our premium vinyl stickers. We have partnered with top-tier courier services (via Shiprocket) to ensure your order reaches you safely and as quickly as possible.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">1. Order Processing Time</h2>
              </div>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>All orders are processed and printed within <span className="font-semibold text-gray-900">24 to 48 hours</span> (excluding Sundays and public holidays).</li>
                <li>If we are experiencing a high volume of orders, shipments may be delayed by a few days. We will communicate any significant delays via email or SMS.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">2. Shipping Rates & Delivery Estimates</h2>
              </div>
              <p className="mb-4">We deliver across India. Our shipping charges are simple and transparent:</p>
              
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-3 mb-3">
                  <span className="font-semibold text-gray-900">Standard Shipping</span>
                  <span className="font-bold text-indigo-600">₹49</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Orders above ₹499</span>
                  <span className="font-bold text-green-600">FREE SHIPPING 🎉</span>
                </div>
              </div>

              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><span className="font-semibold text-gray-900">Delivery Timeline:</span> Generally, orders are delivered within <span className="font-semibold text-gray-900">3 to 7 business days</span> after dispatch, depending on your location.</li>
                <li>Metro cities usually receive orders faster, while remote areas may take slightly longer.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Shipment Confirmation & Order Tracking</h2>
              <p>
                Once your order has been dispatched, you will receive a Shipment Confirmation email/SMS containing your tracking number(s). The tracking link will become active within 24 hours. You can use this link to track your stickers right to your doorstep.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. International Shipping</h2>
              <p>
                Currently, StickySpot only ships within <span className="font-semibold text-gray-900">India</span>. We do not offer international shipping at this time. We are working hard to expand our reach in the future!
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">5. Damages & Lost Packages</h2>
              </div>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>StickySpot ensures that all stickers are packed securely to prevent bending or damage during transit.</li>
                <li>If you receive a damaged product, please contact us immediately at <span className="font-semibold text-indigo-600">wecarestickyspot@gmail.com</span> with photos of the damaged packaging and product.</li>
                <li>If your tracking shows "Delivered" but you haven't received the package, please check with your neighbors or building security before contacting us.</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Us About Your Shipment</h2>
              <p className="mb-6">If you have any questions about your order's shipping status, feel free to reach out:</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Mail aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Email Address</span>
                    <a href="mailto:wecarestickyspot@gmail.com" className="text-indigo-600 hover:underline font-semibold">wecarestickyspot@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Phone Number</span>
                    <a href="tel:+919982820706" className="text-gray-900 hover:text-indigo-600 transition font-semibold">+91 9982820706</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin aria-hidden="true" className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Dispatch Center</span>
                    <span className="text-gray-900 font-medium">StickySpot, Piprali Road, Sikar, Rajasthan 332001</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* Interlinking for SEO */}
            <div className="mt-8 p-5 bg-indigo-50/50 rounded-xl text-center border border-indigo-100">
              <p className="text-gray-600">
                Need to return an item? Read our{" "}
                <Link href="/legal/refund-policy" className="text-indigo-600 font-semibold hover:underline">
                  Refund & Return Policy
                </Link>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}