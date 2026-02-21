"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

// 🛡️ Zod Schemas
const idSchema = z.string().min(1, "ID is required"); 
const statusSchema = z.enum(["UNVERIFIED", "PENDING", "PAID", "PROCESSING", "PRINTING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]); 

// --- 🔒 Security Check Helper ---
async function checkAdmin() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!user || !userEmail || userEmail !== adminEmail) {
    console.warn(`🚨 SECURITY ALERT: Unauthorized access attempt by ${userEmail || "Unknown IP"}`);
    return { authorized: false };
  }
  return { authorized: true, userEmail };
}

// --- 🗑️ 1. DELETE PRODUCT ACTION ---
export async function deleteProduct(productId: string) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) return { success: false, message: "Unauthorized: You are not an Admin!" }; 

    const validId = idSchema.parse(productId);

    const productToDelete = await prisma.product.findUnique({ 
      where: { id: validId },
      select: { title: true } 
    });
    
    if (!productToDelete) return { success: false, message: "Product not found" };

    const orderCount = await prisma.orderItem.count({ where: { productId: validId } });
    
    if (orderCount > 0) {
      // 🛡️ Soft Delete (Archive)
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

    // 💣 Hard Delete
    await prisma.product.delete({ where: { id: validId } });
    console.info(`✅ AUDIT: Product "${productToDelete.title}" DELETED by ${adminCheck.userEmail}`);

    revalidatePath("/admin"); 
    revalidatePath("/shop");
    revalidatePath("/"); 
    return { success: true, message: "Product deleted successfully!" };

  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    return { success: false, message: "Something went wrong while deleting." };
  }
}

// --- 📦 2. SECURE UPDATE ORDER STATUS ---
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) return { success: false, message: "Unauthorized: You are not an Admin!" };

    const validId = idSchema.parse(orderId);
    const validStatus = statusSchema.parse(newStatus); 

    // 🔍 1. Existence Check
    const order = await prisma.order.findUnique({
      where: { id: validId },
      select: { status: true, id: true }
    });

    if (!order) return { success: false, message: "Order not found in database." };

    // 🧠 2. The State Machine (Valid Transitions logic)
    const validTransitions: Record<string, string[]> = {
      "UNVERIFIED": ["PROCESSING", "CANCELLED"], 
      "PENDING": ["CANCELLED"], // Webhook se PAID aayega
      "PAID": ["PROCESSING", "PRINTING", "SHIPPED", "REFUNDED"],
      "PROCESSING": ["PRINTING", "SHIPPED", "CANCELLED"],
      "PRINTING": ["SHIPPED", "CANCELLED"],
      "SHIPPED": ["DELIVERED", "REFUNDED"],
      "DELIVERED": ["REFUNDED"],
      "CANCELLED": [], 
      "REFUNDED": [],  
    };

    const allowedNextStates = validTransitions[order.status] || [];

    // 🛑 Fraud Protection: Check if transition is allowed
    if (!allowedNextStates.includes(validStatus)) {
      return { 
        success: false, 
        message: `🚨 Invalid Flow: Cannot jump from ${order.status} to ${validStatus}` 
      };
    }

    // 🟢 3. Final Database Update
    await prisma.order.update({
      where: { id: validId },
      data: { status: validStatus as OrderStatus },
    });

    console.info(`✅ AUDIT: Order #${validId.slice(-8)} status changed from ${order.status} to [${validStatus}] by ${adminCheck.userEmail}`);

    // 4. Cache Clear
    revalidatePath("/admin");
    revalidatePath("/orders"); 
    revalidatePath(`/orders/${validId}`); 
    
    return { success: true, message: `Status securely updated to ${validStatus}` };

  } catch (error) {
    console.error("❌ Update Status Error:", error);
    return { success: false, message: "Server error updating status." };
  }
}