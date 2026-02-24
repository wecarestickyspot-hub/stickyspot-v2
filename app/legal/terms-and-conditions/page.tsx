import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, MapPin, Phone, Mail } from "lucide-react";

// 🎯 7️⃣ SEO Upgrade
export const metadata: Metadata = {
  title: "Terms & Conditions – StickySpot India | Sticker Store Policies",
  description:
    "Read StickySpot’s official Terms & Conditions for shopping premium vinyl stickers online in India. Learn about payments, shipping, returns, and user policies.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "February 2026";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Document Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 relative z-10">
          
          {/* Header */}
          <div className="mb-10 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="p-4 bg-indigo-50 rounded-2xl inline-flex w-fit">
              <ShieldCheck className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Terms & Conditions
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-600 leading-relaxed text-base sm:text-lg">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to StickySpot</h2>
              <p className="mb-4">
                Welcome to StickySpot! These Terms & Conditions outline the rules and regulations for the use of StickySpot's website, located at <Link href="/" className="text-indigo-600 hover:underline">stickyspot.in</Link>.
              </p>
              <p>
                By accessing this website and purchasing our products, we assume you accept these terms and conditions in full. Do not continue to use StickySpot if you do not agree to all of the terms and conditions stated on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Online Store Terms</h2>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>By agreeing to these Terms, you represent that you are at least the age of majority in your state or province of residence.</li>
                <li>You may not use our products for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction (including but not limited to copyright laws).</li>
                <li>You must not transmit any worms, viruses, or any code of a destructive nature.</li>
                <li>A breach or violation of any of the Terms will result in an immediate termination of your Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Products & Services (Vinyl Stickers)</h2>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><span className="font-semibold text-gray-900">Color Accuracy:</span> We have made every effort to display the colors and images of our premium vinyl stickers as accurately as possible. However, we cannot guarantee that your computer monitor's display of any color will be 100% accurate.</li>
                <li><span className="font-semibold text-gray-900">Quality:</span> Our stickers are designed to be waterproof and highly durable. However, extreme wear and tear or exposure to harsh chemicals may affect their longevity.</li>
                <li>We reserve the right to limit the sales of our products to any person, geographic region, or jurisdiction within India.</li>
                <li>All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Pricing and Payments</h2>
              <p className="mb-4">All prices on our website are listed in Indian Rupees (INR). Prices for our products are subject to change without notice.</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>We reserve the right to modify or discontinue any product at any time.</li>
                <li>Payments are processed securely through trusted third-party payment gateways (such as Razorpay). We do not store your credit/debit card information.</li>
                <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Shipping & Delivery</h2>
              <p>
                We strive to process and dispatch orders as quickly as possible. Delivery timelines provided are estimates and may vary due to factors beyond our control (such as courier delays or natural factors). We are not liable for delays caused by third-party shipping partners.
              </p>
            </section>

            {/* 🔥 1️⃣ Returns & Replacements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Returns & Replacements</h2>
              <p>
                If you receive a damaged or incorrect product, please contact us within 48 hours of delivery with clear photos of the issue. We will review your request and provide a replacement where applicable.
              </p>
              <p className="mt-3">
                Due to the nature of our products, we do not accept returns for change of mind.
              </p>
            </section>

            {/* 🔥 2️⃣ Order Cancellation */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Order Cancellation</h2>
              <p>
                Orders can be cancelled within 2 hours of placing the order. Once dispatched, cancellation is not possible.
              </p>
            </section>

            {/* 🔥 3️⃣ Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p>
                All sticker designs, graphics, and content on this website are the intellectual property of StickySpot. Unauthorized reproduction, resale, or redistribution is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
              <p>
                Certain content, products, and services available via our store may include materials from third parties. Third-party links on this site may direct you to websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy, and we do not warrant and will not have any liability or responsibility for any third-party materials or websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Prohibited Uses</h2>
              <p className="mb-4">In addition to other prohibitions, you are prohibited from using the site or its content:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts.</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
                <li>To harass, abuse, insult, harm, defame, slander, or discriminate.</li>
                <li>To submit false or misleading information.</li>
                <li>To upload or transmit viruses or any other type of malicious code.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p>
                In no case shall StickySpot, our directors, officers, employees, affiliates, agents, contractors, or suppliers be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, arising from your use of any of the service or any products procured using the service.
              </p>
            </section>

            {/* 🔥 4️⃣ Force Majeure */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Force Majeure</h2>
              <p>
                We shall not be held liable for any delay or failure in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, strikes, or courier disruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">12. Governing Law & Jurisdiction</h2>
              <p>
                These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in <span className="font-semibold text-gray-900">Sikar, Rajasthan, India (332001)</span>.
              </p>
            </section>

            <section className="bg-indigo-50 p-6 sm:p-8 rounded-2xl border border-indigo-100 mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="mb-6">Questions about the Terms & Conditions should be sent to us using the details below:</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Email Address</span>
                    {/* ⚠️ 6️⃣ Consistent Email */}
                    <a href="mailto:wecarestickyspot@gmail.com" className="text-indigo-600 hover:underline font-semibold">wecarestickyspot@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Phone Number</span>
                    <a href="tel:+919982820706" className="text-gray-900 hover:text-indigo-600 transition font-semibold">+91 9982820706</a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                  <div>
                    <span className="block text-sm font-medium text-gray-500">Registered Address</span>
                    <span className="text-gray-900 font-medium">StickySpot, Piprali Road, Sikar, Rajasthan 332001, India</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* Interlinking for SEO */}
            <div className="mt-8 p-5 bg-gray-50 rounded-xl text-center border border-gray-200">
              <p className="text-gray-600">
                Please also read our{" "}
                <Link href="/legal/privacy-policy" className="text-indigo-600 font-semibold hover:underline">
                  Privacy Policy
                </Link>
                {" "}and{" "}
                <Link href="/legal/shipping-policy" className="text-indigo-600 font-semibold hover:underline">
                  Shipping Policy
                </Link>.
              </p>
            </div>

            {/* 🔥 5️⃣ Micro Trust CTA */}
            <div className="mt-12 text-center bg-gray-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Shop Premium Waterproof Stickers with Confidence
              </h3>
              <p className="text-gray-400 mb-8 text-sm sm:text-base">
                Secure checkout • Fast delivery • Trusted by creators across India
              </p>
              <Link
                href="/shop"
                className="inline-block bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30"
              >
                Explore Collection →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}