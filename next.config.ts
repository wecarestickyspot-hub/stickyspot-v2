import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🛡️ FIX 4: React Strict Mode (Development mein hidden bugs pakadne ke liye best)
  reactStrictMode: true,
  
  // 🛡️ FIX 3: Explicit Compression (Ensures Gzip/Brotli hamesha on rahe)
  compress: true,

  // ⚡ Speed Optimization: Images ko compress aur modern formats mein convert karega
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF WebP se bhi halka hota hai
    deviceSizes: [640, 750, 828, 1080, 1200], // Mobile ke liye chhote sizes generate karega
    
    // 🛡️ FIX 1: Explicit Cache Control (Vercel optimization costs bachane ke liye)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache (Images bar-bar process nahi hongi)

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // 🛡️ FIX 2: Security - Sirf aapke account ki Cloudinary images allow hongi
        pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/**`,
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Extra Speed: Production build mein source maps hata deta hai
  productionBrowserSourceMaps: false, 
};

export default nextConfig;