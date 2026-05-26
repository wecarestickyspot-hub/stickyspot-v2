import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.stickyspot.in";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',      // Admin panel chhupa do (Security)
        '/api',        // API routes ki zarurat nahi (Saves crawl budget)
        '/checkout',   // Personal details pages
        '/cart',       // Cart page private hona chahiye
        '/orders',     // Order success/history pages ko hide karo
        '/sign-in',    // Auth pages
        '/sign-up',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}