"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/checkRole";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { z } from "zod";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { pushOrderToShiprocket, generateAWB, requestPickup, generateLabel } from "@/lib/shiprocket";


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

    const slug = z.string().regex(/^[a-zA-Z0-9-_]+$/).parse(formData.get("slug"));
    const existing = await prisma.product.findFirst({ where: { slug, NOT: { id } } });
    if (existing) return { success: false, message: "Slug already exists" };

    await prisma.product.update({
      where: { id },
      data: {
        title: z.string().min(3).parse(formData.get("title")),
        slug: slug, // 🚀 FIX 1: Slug update add kiya
        category: formData.get("category") as string, // 🚀 FIX 2: Category save hogi ab
        originalPrice: formData.get("originalPrice") ? Number(formData.get("originalPrice")) : null, // 🚀 FIX 3: MRP save hoga
        price: z.coerce.number().positive().parse(formData.get("price")),
        stock: z.coerce.number().int().nonnegative().parse(formData.get("stock")),
        description: (formData.get("description") as string).replace(/<[^>]*>?/gm, ""),
        status: formData.get("status") as any,
        images: imageArraySchema.parse(JSON.parse(formData.get("images") as string))
      },
    });

    revalidatePath("/admin/products"); 
    revalidatePath("/shop"); 
    revalidatePath(`/product/${slug}`);
    
    return { success: true, message: "Updated! ✨" };
  } catch (error: any) { 
    console.error("❌ Update Product Error:", error);
    return { success: false, message: "Update failed: " + error.message }; 
  }
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

    // 🛡️ FIX 1: Safely saari values nikaalo taaki Null error (crash) na aaye
    const thresholdRaw = formData.get("threshold");
    const chargeRaw = formData.get("charge");
    const textRaw = formData.get("text");
    const themeRaw = formData.get("theme"); // 🚀 Naya Theme field

    // 🛡️ FIX 2: Sirf wahi data update karo jo form se aaya hai
    const updateData: any = {};
    if (thresholdRaw !== null) updateData.freeShippingThreshold = z.coerce.number().parse(thresholdRaw);
    if (chargeRaw !== null) updateData.shippingCharge = z.coerce.number().parse(chargeRaw);
    if (textRaw !== null) updateData.announcementText = String(textRaw).slice(0, 100);
    if (themeRaw !== null) updateData.theme = String(themeRaw); // 👈 Theme save hogi ab!

    await prisma.storeSettings.upsert({
      where: { id: "global_settings" },
      update: updateData,
      create: { 
        id: "global_settings", 
        freeShippingThreshold: 499, 
        shippingCharge: 49,
        theme: themeRaw ? String(themeRaw) : "Premium Light" // Default theme
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) { 
    // 🛡️ FIX 3: Asli error console mein dikhega ab
    console.error("❌ Settings Update Error:", error);
    return { error: "Settings failed: " + error.message }; 
  }
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

export async function createBundle(formData: FormData) {
  try {
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { success: false, error: "Unauthorized" };

    const title = z.string().min(3).parse(formData.get("title"));
    const price = z.coerce.number().parse(formData.get("price"));
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;
    const slug = formData.get("slug") as string || `${generateSlug(title)}-${nanoid(4)}`;
    
    // Parse the JSON string sent from frontend array
    const productIdsString = formData.get("productIds") as string;
    const productIds = JSON.parse(productIdsString) as string[];

    if (productIds.length < 2) return { success: false, error: "Need at least 2 products" };

    const newBundle = await prisma.bundle.create({
      data: {
        title,
        price,
        description,
        image,
        slug,
        products: { connect: productIds.map(id => ({ id })) } // Prisma syntax to connect M2M
      }
    });

    revalidatePath("/admin/bundles"); 
    revalidatePath("/shop");
    return { success: true, bundle: newBundle };
  } catch (error) { 
    console.error("Bundle Create Error:", error);
    return { success: false, error: "Bundle creation failed" }; 
  }
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

// ==========================================
// 🚚 ORDER STATUS & SHIPROCKET AUTOMATION
// ==========================================

// ==========================================
// 🚚 ORDER STATUS & SHIPROCKET AUTOMATION
// ==========================================

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // 1. Tumhara apna secure 'checkAdmin' function use kar rahe hain
    const adminCheck = await checkAdmin("ADMIN");
    if (!adminCheck.authorized) return { success: false, error: "Unauthorized" };

    // 2. Database mein status update karo aur Order ki details nikaalo
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
      include: { items: true } // Items zaroori hain Shiprocket ko batane ke liye
    });

    // 3. 🔥 THE AUTOMATION: Agar status 'PROCESSING' kiya aur pehle Shiprocket par nahi bheja hai
    if (newStatus === "PROCESSING" && !updatedOrder.shiprocketOrderId) {
      try {
        console.log("🚀 Pushing order to Shiprocket...");
        const srData = await pushOrderToShiprocket(updatedOrder);
        
        console.log("🏷️ Generating AWB Label...");
        const awbData = await generateAWB(srData.shipmentId.toString());

        console.log("🏍️ Requesting Courier Pickup...");
        await requestPickup(srData.shipmentId.toString());

        console.log("🖨️ Fetching Label PDF Link...");
        const labelUrl = await generateLabel(srData.shipmentId.toString());

        // 4. Sab kuch DB mein ek sath save kar lo
        await prisma.order.update({
          where: { id: orderId },
          data: {
            shiprocketOrderId: srData.shiprocketOrderId.toString(),
            shipmentId: srData.shipmentId.toString(),
            awbCode: awbData.awbCode,   // 👈 Barcode save ho gaya!
            trackingUrl: labelUrl,      // 👈 Label PDF link save ho gaya!
          }
        });
        console.log(`✅ Success! Courier requested & Label ready: ${awbData.awbCode}`);
      } catch (srError) {
        console.error("❌ Failed Shiprocket Automation:", srError);
        // Note: Hum yahan DB status update fail nahi kar rahe agar Shiprocket down ho
      }
    }

    // 5. Admin Dashboard ko auto-refresh karo
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);
    
    return { success: true, order: updatedOrder };

  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 📦 BUNDLE ENGINE (Updated with Admin Data Fetcher)
// ==========================================

export async function getAdminBundleData() {
  const adminCheck = await checkAdmin("ADMIN");
  if (!adminCheck.authorized) throw new Error("Unauthorized");

  // 1. Fetch only ACTIVE products to show in the checkboxes
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { 
      id: true, 
      title: true, 
      price: true, 
      images: true, 
      stock: true, 
      status: true 
    }
  });

  // 2. Fetch existing Bundles
  const bundles = await prisma.bundle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: { select: { id: true } } // Fetching length of products connected
    }
  });

  // 3. Format the data perfectly for the frontend UI
  const formattedProducts = products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: Array.isArray(p.images) ? p.images[0] : "/placeholder.png", // Get 1st image
    stock: p.stock,
    status: p.status
  }));

  const formattedBundles = bundles.map(b => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    price: b.price,
    image: b.image,
    itemCount: b.products.length
  }));

  return { products: formattedProducts, bundles: formattedBundles };
}