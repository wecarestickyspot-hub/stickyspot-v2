import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.stickyspot.in";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',      // Admin panel chhupa do
        '/api',        // API routes ki zarurat nahi
        '/checkout',   // Personal details pages
        '/sign-in',    // Auth pages
        '/sign-up',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}