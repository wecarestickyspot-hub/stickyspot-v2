import type { Metadata } from "next";
import Link from "next/link";

// ✅ 1️⃣ Advanced SEO Upgrade
export const metadata: Metadata = {
  title: "Privacy Policy – StickySpot India | Data Protection & User Privacy",
  description:
    "Read the official Privacy Policy of StickySpot India. Learn how we collect, use, store, and protect your personal data when you shop premium vinyl stickers online.",
  keywords: [
    "StickySpot Privacy Policy",
    "StickySpot data protection",
    "online shopping privacy India",
    "vinyl sticker store privacy policy"
  ],
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "February 2026"; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Document Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
          
          {/* Header */}
          <div className="mb-10 border-b border-gray-100 pb-8 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-600 leading-relaxed text-base sm:text-lg relative z-10">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
              <p>
                At StickySpot, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your data when you visit our website or use our services. By using StickySpot, you agree to the practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect information to provide you with the best shopping experience. The types of information we collect include:</p>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>Shipping and Billing Address</li>
                    <li>Date of Birth (optional)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Information</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    <li>Payment method details (processed securely by third-party gateways)</li>
                    <li>Transaction history and order details</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Usage Data</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                    <li>Browser type and version</li>
                    <li>IP address and device information</li>
                    <li>Pages visited, time spent, and click behavior</li>
                    <li>Cookies and tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect for the following purposes:</p>
              <ul className="space-y-2 ml-4">
                <li><span className="font-semibold text-gray-900">Order Processing:</span> To fulfill and deliver your orders.</li>
                <li><span className="font-semibold text-gray-900">Account Management:</span> To create and manage your account.</li>
                <li><span className="font-semibold text-gray-900">Customer Support:</span> To respond to your inquiries and resolve issues.</li>
                <li><span className="font-semibold text-gray-900">Personalization:</span> To recommend products based on your preferences.</li>
                <li><span className="font-semibold text-gray-900">Marketing:</span> To send promotional offers, newsletters, and updates (you can opt-out anytime).</li>
                <li><span className="font-semibold text-gray-900">Analytics:</span> To improve website performance and user experience.</li>
                {/* ✅ 3️⃣ Indian Legal Compliance Added */}
                <li><span className="font-semibold text-gray-900">Legal Compliance:</span> To comply with applicable Indian data protection laws and IT Act regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Protect Your Data</h2>
              <ul className="space-y-3 ml-4">
                <li><span className="font-semibold text-gray-900">Encryption:</span> All sensitive data transmitted through our website is encrypted using SSL (Secure Socket Layer) technology.</li>
                <li><span className="font-semibold text-gray-900">Secure Servers:</span> Your data is stored on secure servers with restricted access. We regularly monitor and update our security measures.</li>
                {/* ✅ 2️⃣ Razorpay / Payment Gateway Explicit Mention Added */}
                <li><span className="font-semibold text-gray-900">Payment Security:</span> Payments are securely processed via trusted payment gateways such as Razorpay. We do not store your debit/credit card details on our servers. All payments are processed through PCI-DSS compliant channels.</li>
                <li><span className="font-semibold text-gray-900">Access Control:</span> Only authorized personnel have access to your personal information, and they are bound by strict confidentiality agreements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Cookies & Tracking Technologies</h2>
              <p className="mb-3"><span className="font-semibold text-gray-900">What are Cookies?</span> Cookies are small text files stored on your device to enhance your browsing experience.</p>
              <p className="font-semibold text-gray-900 mb-2">How We Use Cookies:</p>
              <ul className="list-disc list-inside ml-4 mb-3 space-y-1">
                <li>Remember your preferences and login status</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize content and advertisements</li>
                <li>Improve website functionality</li>
              </ul>
              <p><span className="font-semibold text-gray-900">Managing Cookies:</span> You can control or disable cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Sharing Your Information</h2>
              <p className="mb-4">We respect your privacy and do not sell or rent your personal information to third parties. However, we may share your data with:</p>
              <ul className="space-y-2 ml-4 mb-4">
                <li><span className="font-semibold text-gray-900">Service Providers:</span> Trusted partners who help us operate our business (e.g., payment processors like Razorpay, delivery services like Shiprocket, email providers).</li>
                <li><span className="font-semibold text-gray-900">Legal Authorities:</span> When required by law or to protect our legal rights.</li>
                <li><span className="font-semibold text-gray-900">Business Transfers:</span> In the event of a merger, acquisition, or sale of assets.</li>
              </ul>
              <p>All third parties are required to maintain the confidentiality of your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="mb-4">You have the following rights regarding your personal data:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Access</h3>
                    <p className="text-sm">Request a copy of your data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl">✏️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Correction</h3>
                    <p className="text-sm">Update or correct your information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl">🗑️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Deletion</h3>
                    <p className="text-sm">Request deletion of your data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-xl">🚫</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Opt-Out</h3>
                    <p className="text-sm">Unsubscribe from marketing emails</p>
                  </div>
                </div>
              </div>
              {/* ✅ 5️⃣ Email Consistency Fixed */}
              <p className="mt-4">To exercise any of these rights, please contact us at <a href="mailto:wecarestickyspot@gmail.com" className="text-indigo-600 hover:underline">wecarestickyspot@gmail.com</a></p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. Once your data is no longer needed, we will securely delete or anonymize it.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Updates to This Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page with a revised "Last Updated" date. Continued use of our services after changes indicates your acceptance of the updated policy.</p>
            </section>

            <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="mb-4">If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please don't hesitate to reach out:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-xl">📧</span> 
                  <span className="font-medium text-gray-900">Email:</span> 
                  {/* ✅ 5️⃣ Email Consistency Fixed */}
                  <a href="mailto:wecarestickyspot@gmail.com" className="text-indigo-600 hover:underline font-semibold">wecarestickyspot@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-xl">📱</span> 
                  <span className="font-medium text-gray-900">Phone:</span> 
                  <a href="tel:+919982820706" className="hover:text-indigo-600 transition font-semibold">+91 9982820706</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🏢</span> 
                  <div>
                    <span className="font-medium text-gray-900">Address:</span><br/>
                    StickySpot, Piprali Road, Sikar, Rajasthan 332001
                  </div>
                </li>
              </ul>
            </section>

            {/* ✅ 4️⃣ Interlinking for SEO & User Experience Added */}
            <div className="mt-8 p-5 bg-gray-50 rounded-xl text-center border border-gray-200">
              <p className="text-gray-600">
                Please also review our{" "}
                <Link href="/legal/refund-policy" className="text-indigo-600 font-semibold hover:underline">
                  Refund & Return Policy
                </Link>
                {" "}for information on order cancellations and returns.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}