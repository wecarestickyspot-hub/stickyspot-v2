import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.stickyspot.in"; 

  // 📝 Footer wale saare static pages ki list
  const staticRoutes = [
    "",                      // Home Page
    "/shop",                 // All Stickers
    "/custom-stickers",      // Custom Stickers
    "/track-order",          // Track Order
    "/privacy-policy",       // Privacy Policy
    "/terms-and-conditions", // Terms & Conditions
    "/refund-policy",  // Refund & Cancellation
    "/shipping-policy",      // Shipping Policy
    "/contact",              // Contact Us
  ];

  // In sabka sitemap format tayar karna
  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    // Home aur Shop ko high priority, policies ko normal priority
    priority: route === "" ? 1.0 : (route === "/shop" ? 0.9 : 0.6), 
  }));

  try {
    // Database se saare active products nikalna
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });

    const productEntries = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    // 🚀 Static Pages + Products = Complete Sitemap
    return [...staticEntries, ...productEntries];

  } catch (error) {
    console.error("Sitemap generation error:", error);
    
    // 🛡️ Fallback: Agar DB error aaye, toh kam se kam static pages zaroor index ho jayein
    return [...staticEntries];
  }
}