"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { z } from "zod";
import slugify from "slugify"; // ✅ Advanced SEO Slugify

// ==========================================
// 🛡️ ADVANCED ZOD SCHEMAS (With Coercion & XSS Protection)
// ==========================================
const idSchema = z.string().cuid("Invalid Product ID format");

// 🔒 Image Validation: Koi "javascript:alert(1)" nahi daal payega
const imagesSchema = z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required");

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  // 🪄 Zod Coercion: Automatically converts string from FormData to Number securely
  price: z.coerce.number().positive("Price must be greater than 0"),
  originalPrice: z.coerce.number().positive().nullable().optional().catch(null),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  category: z.string().min(2, "Category is required"),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  slug: z.string().optional(),
});

// ==========================================
// 🔒 ADMIN AUTH & AUDIT HELPER
// ==========================================
async function checkAdmin() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL; 

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown IP";

  if (!user || !userEmail || userEmail !== adminEmail) {
    console.warn(JSON.stringify({
      event: "UNAUTHORIZED_PRODUCT_ACTION",
      email: userEmail || "Anonymous",
      ip,
      timestamp: new Date().toISOString()
    }));
    return { authorized: false, ip };
  }

  return { authorized: true, userEmail, ip };
}

// ==========================================
// 📦 1. CREATE PRODUCT ACTION
// ==========================================
export async function createProduct(formData: FormData) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) {
      return { success: false, message: "Unauthorized access." };
    }

    // 1. Safe Image Parsing & Validation
    let parsedImages: string[] = [];
    try {
      const rawImages = JSON.parse(formData.get("images")?.toString() || "[]");
      parsedImages = imagesSchema.parse(rawImages); // 🛡️ URL Validation
    } catch (err) {
      return { success: false, message: "Invalid image format or malicious URL detected." };
    }

    // 2. Magic Zod Coercion Validation (No more manual parseFloat)
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = productSchema.safeParse(rawData);

    if (!validatedData.success) {
      console.error("Validation Failed:", validatedData.error.flatten());
      return { success: false, message: "Invalid product data provided." };
    }

    const data = validatedData.data;
    let finalProcessedSlug = ""; // 🌐 Outer scope variable for cache invalidation

    // 3. Safe Database Transaction
    await prisma.$transaction(async (tx) => {
      // 🔄 SEO Optimized Slug Collision Handling
      let baseSlug = data.slug || slugify(data.title, { lower: true, strict: true });
      const existingSlug = await tx.product.findUnique({ where: { slug: baseSlug } });
      
      finalProcessedSlug = existingSlug 
        ? `${baseSlug}-${Math.random().toString(36).substring(2, 7)}` 
        : baseSlug;

      const newProduct = await tx.product.create({
        data: {
          ...data,
          slug: finalProcessedSlug,
          images: parsedImages,
        },
      });

      // 📝 Structured Audit Logging
      console.info(JSON.stringify({
        event: "PRODUCT_CREATED",
        productId: newProduct.id,
        productName: newProduct.title,
        adminEmail: adminCheck.userEmail,
        adminIp: adminCheck.ip,
        timestamp: new Date().toISOString()
      }));
    });

    // 4. Cache Invalidation
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    // ✅ Revalidating specific newly created product page just in case
    revalidatePath(`/product/${finalProcessedSlug}`); 
    
    return { success: true, message: "Product created successfully!" };

  } catch (error) {
    console.error(JSON.stringify({ event: "PRODUCT_CREATE_ERROR", error: String(error) }));
    return { success: false, message: "Server error while creating product." };
  }
}

// ==========================================
// ✏️ 2. UPDATE PRODUCT ACTION
// ==========================================
export async function updateProduct(productId: string, formData: FormData) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) {
      return { success: false, message: "Unauthorized access." };
    }

    // 1. ID Validation
    const validId = idSchema.parse(productId);

    // 2. Safe Image Parsing & Validation
    let parsedImages: string[] = [];
    try {
      const rawImages = JSON.parse(formData.get("images")?.toString() || "[]");
      parsedImages = imagesSchema.parse(rawImages); // 🛡️ URL Validation
    } catch {
      return { success: false, message: "Invalid image format or malicious URL detected." };
    }

    // 3. Magic Zod Coercion Validation
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = productSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { success: false, message: "Invalid product data provided." };
    }

    const data = validatedData.data;
    let finalProcessedSlug = ""; // 🌐 Outer scope variable

    // 4. Safe Database Transaction
    await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({ where: { id: validId } });
      if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");

      // 🔄 SEO Optimized Slug Collision Handling (Excluding current product)
      let baseSlug = data.slug || slugify(data.title, { lower: true, strict: true });
      const conflictingSlug = await tx.product.findFirst({ 
        where: { slug: baseSlug, id: { not: validId } } 
      });
      
      finalProcessedSlug = conflictingSlug 
        ? `${baseSlug}-${Math.random().toString(36).substring(2, 7)}` 
        : baseSlug;

      await tx.product.update({
        where: { id: validId },
        data: {
          ...data,
          slug: finalProcessedSlug,
          images: parsedImages,
        },
      });

      // 📝 Structured Audit Logging
      console.info(JSON.stringify({
        event: "PRODUCT_UPDATED",
        productId: validId,
        productName: data.title,
        adminEmail: adminCheck.userEmail,
        adminIp: adminCheck.ip,
        timestamp: new Date().toISOString()
      }));
    });

    // 5. Cache Invalidation using the CORRECT final slug
    revalidatePath("/admin/products");
    revalidatePath(`/product/${finalProcessedSlug}`); // ✅ Bug Fixed: Using outer scoped verified slug
    
    return { success: true, message: "Product updated successfully!" };

  } catch (error) {
    console.error(JSON.stringify({ event: "PRODUCT_UPDATE_ERROR", error: String(error) }));
    
    if (error instanceof z.ZodError) return { success: false, message: "Invalid ID format." };
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") return { success: false, message: "Product not found." };
    
    return { success: false, message: "Server error while updating product." };
  }
}