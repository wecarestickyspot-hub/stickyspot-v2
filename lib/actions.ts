"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/checkRole";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";


// ==========================================
// 🔒 REUSABLE SCHEMAS & UTILS
// ==========================================
const idSchema = z.string().cuid("Invalid ID format");
const imageArraySchema = z.array(z.string().url()).min(1, "At least one image is required");

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/[^\w-]+/g, "").replace(/--+/g, "-");

// ==========================================
// 🛡️ SECURITY: RBAC HELPER (The Heart of Security)
// ==========================================
async function checkAdmin(requiredRole: "ADMIN" | "SUPER_ADMIN" | "SUPPORT" = "ADMIN") {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;

  const headersList = await headers();
  const rawIp = headersList.get("x-forwarded-for");
  const ip = rawIp?.split(",")[0].trim() ?? headersList.get("x-real-ip") ?? "Unknown IP";

  if (!user || !userEmail) return { authorized: false, ip };

  // 🚨 AWAITED RBAC Check
  const hasClerkRole = await checkRole(requiredRole);
  const isOwner = userEmail === adminEmail;

  // Hum DB check hata denge aur sirf Clerk/Env par bharosa karenge
  // Kyunki humne pehle hi 'hasClerkRole' aur 'isOwner' check kar liya hoga upar

  // Agar upar Clerk role check pass nahi hua, toh seedha fail kar do
  // (DB check ki zaroorat nahi hai)
  if (!hasClerkRole && !isOwner) {
    throw new Error("Unauthorized Access");
  }

  // Return user info
  return { authorized: true, userEmail, userId: user.id, ip };
}

// ==========================================
// 1. PRODUCT ENGINE
// ==========================================

export async function createProduct(formData: FormData) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { success: false, message: "Unauthorized" };

    const title = z.string().min(3).parse(formData.get("title"));
    const price = z.coerce.number().positive().parse(formData.get("price"));
    const stock = z.coerce.number().int().nonnegative().parse(formData.get("stock"));
    const images = imageArraySchema.parse(JSON.parse(formData.get("images") as string));

    const slug = `${generateSlug(title)}-${nanoid(6)}`;

    await prisma.product.create({
      data: {
        title, price, images, slug, stock,
        category: z.string().parse(formData.get("category")),
        description: (formData.get("description") as string).replace(/<[^>]*>?/gm, "").slice(0, 2000),
        status: (formData.get("status") as any) || "ACTIVE"
      },
    });

    revalidatePath("/admin/products"); revalidatePath("/shop");
    return { success: true, message: "Product Created! 🎉" };
  } catch (error) { return { success: false, message: "Error creating product" }; }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { success: false, message: "Unauthorized" };

    const slug = z.string().regex(/^[a-z0-9-]+$/).parse(formData.get("slug"));
    const existing = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
    if (existing) return { success: false, message: "Slug already exists" };

    await prisma.product.update({
      where: { id },
      data: {
        title: z.string().min(3).parse(formData.get("title")),
        price: z.coerce.number().positive().parse(formData.get("price")),
        stock: z.coerce.number().int().nonnegative().parse(formData.get("stock")),
        description: (formData.get("description") as string).replace(/<[^>]*>?/gm, ""),
        status: formData.get("status") as any,
        images: imageArraySchema.parse(JSON.parse(formData.get("images") as string))
      },
    });

    revalidatePath("/admin/products"); revalidatePath("/shop"); revalidatePath(`/product/${slug}`);
    return { success: true, message: "Updated! ✨" };
  } catch (error) { return { success: false, message: "Update failed" }; }
}

export async function deleteProduct(formData: FormData) {
  try {
    const adminCheck = await checkAdmin("SUPER_ADMIN");
    if (!adminCheck.authorized) return { success: false, message: "Unauthorized" };

    const id = idSchema.parse(formData.get("id"));
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" as any } });

    revalidatePath("/admin/products");
    return { success: true, message: "Product Archived" };
  } catch (error) { return { success: false, message: "Delete failed" }; }
}

// ==========================================
// 2. COUPON ENGINE
// ==========================================

export async function createCoupon(formData: FormData) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { error: "Unauthorized" };

    const code = String(formData.get("code")).trim().toUpperCase();
    if (await prisma.coupon.findUnique({ where: { code } })) return { error: "Code exists" };

    await prisma.coupon.create({
      data: {
        code,
        discountType: formData.get("discountType") as any,
        value: z.coerce.number().positive().parse(formData.get("value")),
        endDate: new Date(formData.get("endDate") as string),
        isActive: true, usedCount: 0
      }
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) { return { error: "Coupon failed" }; }
}

export async function toggleCouponStatus(id: string) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { error: "Unauthorized" };

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return { error: "Not found" };

    await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) { return { error: "Toggle failed" }; }
}

export async function validateCoupon(code: string, cartTotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase(), isActive: true } });
  if (!coupon || new Date() > new Date(coupon.endDate)) return { error: "Invalid/Expired" };

  let discount = coupon.discountType === "PERCENTAGE" ? (cartTotal * coupon.value) / 100 : coupon.value;
  return { success: true, discount: Math.min(discount, cartTotal), code: coupon.code };
}

// ==========================================
// 3. STORE & USER SETTINGS
// ==========================================

export async function updateStoreSettings(formData: FormData) {
  try {
    const adminCheck = await checkAdmin("SUPER_ADMIN");
    if (!adminCheck.authorized) return { error: "Unauthorized" };

    await prisma.storeSettings.upsert({
      where: { id: "global_settings" },
      update: {
        freeShippingThreshold: z.coerce.number().parse(formData.get("threshold")),
        shippingCharge: z.coerce.number().parse(formData.get("charge")),
        announcementText: (formData.get("text") as string).slice(0, 100)
      },
      create: { id: "global_settings", freeShippingThreshold: 499, shippingCharge: 49 }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) { return { error: "Settings failed" }; }
}

export async function setUserRole(userId: string, role: string) {
  try {
    const adminCheck = await checkAdmin("SUPER_ADMIN");
    if (!adminCheck.authorized) return { error: "Unauthorized" };

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) { return { error: "Role update failed" }; }
}

// ==========================================
// 4. BUNDLES, REVIEWS & WISHLIST
// ==========================================

export async function createBundle(formData: FormData, productIds: string[]) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized || productIds.length === 0) return { error: "Error" };

    const title = z.string().min(3).parse(formData.get("title"));
    await prisma.bundle.create({
      data: {
        title, price: z.coerce.number().parse(formData.get("price")),
        description: formData.get("description") as string,
        image: formData.get("image") as string,
        slug: `${generateSlug(title)}-${nanoid(4)}`,
        products: { connect: productIds.map(id => ({ id })) }
      }
    });

    revalidatePath("/admin/bundles"); revalidatePath("/shop");
    return { success: true };
  } catch (error) { return { error: "Bundle failed" }; }
}

export async function addReview(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false };

    await prisma.review.create({
      data: {
        rating: z.number().min(1).max(5).parse(Number(formData.get("rating"))),
        comment: (formData.get("comment") as string).replace(/<[^>]*>?/gm, ""),
        userId: user.id, userName: user.firstName || "User",
        productId: formData.get("productId") as string,
        imageUrl: formData.get("imageUrl") as string
      }
    });
    revalidatePath(`/product/${formData.get("slug")}`);
    return { success: true };
  } catch (error) { return { success: false }; }
}

export async function toggleWishlist(productId: string, path: string) {
  const user = await currentUser();
  if (!user) return;
  const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  if (existing) await prisma.wishlist.delete({ where: { userId_productId: { userId: user.id, productId } } });
  else await prisma.wishlist.create({ data: { userId: user.id, productId } });
  revalidatePath(path); revalidatePath("/wishlist");
}

// ==========================================
// 📦 BUNDLE ENGINE (Updated with Get & Delete)
// ==========================================

export async function getBundles() {
  try {
    const bundles = await prisma.bundle.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, bundles };
  } catch (error) { return { success: false, error: "Failed to fetch bundles" }; }
}


export async function deleteBundle(id: string) {
  try {
    const adminCheck = await checkAdmin("SUPER_ADMIN");
    if (!adminCheck.authorized) return { error: "Unauthorized" };

    await prisma.bundle.delete({ where: { id } });
    revalidatePath("/admin/bundles"); revalidatePath("/shop");
    return { success: true };
  } catch (error) { return { error: "Delete failed. Bundle might be in orders." }; }
}

// ==========================================
// 🛡️ PAGE LEVEL GUARD (Add this here!)
// ==========================================
export async function requireSuperAdmin() {
  const user = await currentUser();
  const role = (user?.publicMetadata?.role ?? "USER") as string;
  const adminEmail = process.env.ADMIN_EMAIL;

  const isOwner =
    adminEmail &&
    user?.emailAddresses?.some(e => e.emailAddress === adminEmail);

  // Agar logged in nahi hai ya Super Admin/Owner nahi hai, seedha home pe fek do
  if (!user || (role !== "SUPER_ADMIN" && !isOwner)) {
    redirect("/");
  }

  return user;
}

// ==========================================
// 🎟️ COUPON ACTIONS (Add to lib/actions.ts)
// ==========================================

export async function deleteCoupon(id: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized" };

  try {
    await prisma.coupon.delete({
      where: { id },
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}
