"use server";

import { prisma } from "@/lib/prisma"; // ✅ Global Prisma Instance
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod"; // ✅ Input Validation
import { PrismaClient, OrderStatus } from "@prisma/client"; // 👈 OrderStatus zaroori hai

// 🛡️ Zod Schemas for Validation
const idSchema = z.string().min(1, "ID is required"); 

// 🚨 FIX 1: Added missing statuses ("PAID", "PRINTING", "REFUNDED") to match UI dropdowns
const statusSchema = z.enum(["PENDING", "PAID", "PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]); 

// --- 🔒 Security Check Helper (Safe Approach) ---
async function checkAdmin() {
  const user = await currentUser();
  
  // Safe optional chaining: Agar email na ho toh crash nahi hoga
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL; // ENV se uthaya, hardcode nahi
  
  if (!user || !userEmail || userEmail !== adminEmail) {
    // 📝 Basic Security Log (Failed Attempt)
    console.warn(`🚨 SECURITY ALERT: Unauthorized access attempt by ${userEmail || "Unknown IP"}`);
    return { authorized: false };
  }
  
  return { authorized: true, userEmail };
}

// --- 🗑️ 1. DELETE PRODUCT ACTION ---
export async function deleteProduct(productId: string) {
  try {
    // 1. Auth Check
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) {
      return { success: false, message: "Unauthorized: You are not an Admin!" }; 
    }

    // 2. Input Validation
    const validId = idSchema.parse(productId);

    // 3. Check if product exists (For Audit Trail)
    const productToDelete = await prisma.product.findUnique({ 
      where: { id: validId },
      select: { title: true } // Sirf naam chahiye log ke liye
    });
    
    if (!productToDelete) {
      return { success: false, message: "Product not found" };
    }

    // 🚨 FIX 2: Relational DB Safety Check (Prevent Order History Crash)
    // Check karte hain ki kya ye product kisi purane order mein bika hai
    const orderCount = await prisma.orderItem.count({ 
      where: { productId: validId } 
    });
    
    if (orderCount > 0) {
      // Soft Delete (Archive): Agar order history hai, toh delete mat karo, bas INACTIVE kar do
      await prisma.product.update({ 
        where: { id: validId }, 
        data: { status: "INACTIVE" } 
      });
      
      console.info(`✅ AUDIT: Product "${productToDelete.title}" ARCHIVED (In-Use) by ${adminCheck.userEmail}`);
      
      revalidatePath("/admin"); 
      revalidatePath("/shop"); 
      revalidatePath("/");
      return { success: true, message: "Product archived (used in past orders)." };
    }

    // 4. Hard Delete Operation (Agar product kabhi nahi bika hai)
    await prisma.product.delete({
      where: { id: validId },
    });

    // 📝 Audit Trail Logging
    console.info(`✅ AUDIT: Product "${productToDelete.title}" (ID: ${validId}) DELETED by ${adminCheck.userEmail} at ${new Date().toISOString()}`);

    // 5. Cache Clear
    revalidatePath("/admin"); 
    revalidatePath("/shop");
    revalidatePath("/"); 
    
    return { success: true, message: "Product deleted successfully!" };

  } catch (error) {
    console.error("❌ Delete Product Error:", error instanceof Error ? error.message : error);
    
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid product ID format." };
    }
    
    return { success: false, message: "Something went wrong while deleting." };
  }
}

// --- 📦 2. UPDATE ORDER STATUS ACTION ---
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // 1. Auth Check
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) {
      return { success: false, message: "Unauthorized: You are not an Admin!" };
    }

    // 2. Input Validation (Bina iske DB hit nahi hoga)
    const validId = idSchema.parse(orderId);
    const validStatus = statusSchema.parse(newStatus); // Sirf allowed status hi pass honge

    // 3. Database Operation
    await prisma.order.update({
      where: { id: validId },
      data: { status: validStatus as OrderStatus },
    });

    // 📝 Audit Trail Logging
    console.info(`✅ AUDIT: Order #${validId.slice(-8)} status changed to [${validStatus}] by ${adminCheck.userEmail}`);

    // 4. Cache Clear
    revalidatePath("/admin");
    revalidatePath("/orders"); // ✅ Added: Revalidate user's main order list
    revalidatePath(`/orders/${validId}`); // ✅ Added: Revalidate specific user tracking page
    
    return { success: true, message: `Order status updated to ${validStatus}` };

  } catch (error) {
    console.error("❌ Update Status Error:", error instanceof Error ? error.message : error);
    
    if (error instanceof z.ZodError) {
      return { success: false, message: "Invalid status or Order ID provided." };
    }

    return { success: false, message: "Failed to update order status." };
  }
}