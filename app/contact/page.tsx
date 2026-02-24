import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

// ✅ 1️⃣ Advanced SEO Metadata
export const metadata: Metadata = {
  title: "Contact StickySpot | Premium Vinyl Stickers India",
  description:
    "Contact StickySpot for custom vinyl stickers, order support or business inquiries. Based in Rajasthan, shipping across India.",
  keywords: [
    "Contact StickySpot",
    "Custom Stickers India",
    "Vinyl Stickers Rajasthan",
    "Sticker Support",
    "StickySpot Contact"
  ],
  openGraph: {
    title: "Contact StickySpot",
    description:
      "Have questions about our premium waterproof stickers? Get in touch with StickySpot today.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Have a question about our premium stickers? Need help with an order? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 relative z-10">
          
          {/* Left Side: Contact Information */}
          <div className="flex flex-col space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition-shadow hover:shadow-md">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                <p className="mt-2 text-gray-600 leading-relaxed text-sm">
                  Piparli Road Sikar<br />
                  332001 Rajasthan<br />
                  India
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition-shadow hover:shadow-md">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  +91 9982820706
                </p>
                <p className="mt-1 text-gray-400 text-xs">
                  Mon-Fri 10AM-4PM IST
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition-shadow hover:shadow-md">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  wecarestickyspot@gmail.com
                </p>
                <p className="mt-1 text-gray-400 text-xs">
                  We reply within 24 hours
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start transition-shadow hover:shadow-md">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                <ul className="mt-2 text-gray-600 text-sm space-y-1">
                  <li><span className="font-medium">Mon - Fri:</span> 9:00 AM - 6:00 PM</li>
                  <li><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM</li>
                  <li><span className="text-red-500 font-medium">Sunday: Closed</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
            
            {/* ✅ 2️⃣ Trust Boost Line */}
            <p className="text-sm text-gray-500 mb-6 flex items-center">
              🔒 <span className="ml-2">Your information is safe with us. We never share your details.</span>
            </p>
            
            <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
              
              {/* ✅ 3️⃣ Secured Web3Forms Key */}
              <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORM_KEY} />
              
              <input type="hidden" name="subject" value="New Contact Message from StickySpot" />
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
                  <input type="text" name="First Name" id="first-name" required className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border px-4 py-3 text-gray-900 outline-none transition" placeholder="John" />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
                  <input type="text" name="Last Name" id="last-name" className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border px-4 py-3 text-gray-900 outline-none transition" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <input type="email" name="Email" id="email" required className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border px-4 py-3 text-gray-900 outline-none transition" placeholder="john@example.com" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea id="message" name="Message" required rows={4} className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border px-4 py-3 text-gray-900 outline-none transition resize-none" placeholder="Write your message here..."></textarea>
              </div>

              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ✅ 4️⃣ Floating WhatsApp Button */}
      <a 
        href="https://wa.me/919982820706"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#1ebd57] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 z-50 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.835 6.386l-1.573 5.432 5.674-1.465A12 12 0 1 0 11.944 0zM17.43 15.65c-.266.744-1.523 1.436-2.115 1.517-.542.073-1.182.138-3.32-.734-2.583-1.054-4.225-3.69-4.356-3.864-.131-.174-1.04-1.378-1.04-2.628s.647-1.85 1.055-2.27c.307-.318.82-.472 1.25-.472.135 0 .256.005.362.012.338.016.505.039.726.568.277.666.883 2.148.96 2.302.076.155.127.337.026.541-.1.205-.152.33-.305.508-.152.178-.32.385-.456.516-.15.148-.306.31-.133.608.172.298.766 1.268 1.644 2.05.14.124.288.243.44.356.924.693 1.838.995 2.152 1.15.313.155.5.126.685-.084.185-.21 1.082-1.303 1.37-1.748.288-.445.578-.37.986-.217.408.152 2.583 1.217 3.027 1.434.444.217.74.326.848.508.107.182.107 1.053-.16 1.797z"/>
        </svg>
        Chat on WhatsApp
      </a>
    </div>
  );
}