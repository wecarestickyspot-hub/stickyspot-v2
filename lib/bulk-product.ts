"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth"; // 👈 New safe import
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nanoid } from "nanoid";

// 🛡️ 1. Zod Schema for Validation (Strict Rules)
const productImportSchema = z.object({
    title: z.string().min(3, "Title too short").max(150),
    description: z.string().optional(),
    price: z.coerce.number().nonnegative("Price cannot be negative"), // 👈 Prevents -ve price
    stock: z.coerce.number().int().nonnegative(),
    category: z.string().min(1, "Category is required"),
    imageUrl: z.string().url("Invalid Image URL").optional().or(z.literal("")),
});

// Helper: Slug Generator
function generateSecureSlug(title: string) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${base}-${nanoid(6)}`; // 👈 Collision impossible now
}

export async function bulkImportProducts(productsData: any[]) {
    // 🔒 2. Auth Check
    const admin = await requireAdmin();

    // 🧹 3. Validation & Sanitization Loop
    const validProducts = [];
    const errors = [];

    for (const [index, item] of productsData.entries()) {
        const result = productImportSchema.safeParse(item);

        if (!result.success) {
            // 'errors' ki jagah 'issues' use hota hai Zod mein
            errors.push(`Row ${index + 1}: ${result.error.issues[0].message}`);
            continue;
        }

        const data = result.data;

        // 🛡️ Sanitize Description (Remove basic HTML tags if any script injection attempted)
        const sanitizedDesc = data.description?.replace(/<script.*?>.*?<\/script>/gi, "") || "";

        validProducts.push({
            title: data.title,
            slug: generateSecureSlug(data.title),
            description: sanitizedDesc,
            price: data.price,
            stock: data.stock,
            category: data.category,
            images: data.imageUrl ? [data.imageUrl] : [],
            status: "DRAFT", // ⚠️ Safety: Always import as DRAFT first
        });
    }

    if (validProducts.length === 0) {
        return { success: false, error: "No valid products found.", details: errors };
    }

    // 🏗️ 4. Batch Insertion (Chunking to prevent DB Crash)
    const BATCH_SIZE = 50; // Safe limit for Prisma
    let totalInserted = 0;

    try {
        for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
            const batch = validProducts.slice(i, i + BATCH_SIZE);

            await prisma.product.createMany({
                data: batch,
                skipDuplicates: true,
            });

            totalInserted += batch.length;
        }

        // 📝 5. Audit Log (Server Console for now)
        console.info(`[BULK IMPORT] Admin: ${admin.email} | Count: ${totalInserted} | Time: ${new Date().toISOString()}`);

        revalidatePath("/admin/products");
        revalidatePath("/shop");

        return {
            success: true,
            count: totalInserted,
            warnings: errors.length > 0 ? errors : undefined
        };

    } catch (error) {
        console.error("Bulk Import Critical Failure:", error);
        return { success: false, error: "Database transaction failed." };
    }
}