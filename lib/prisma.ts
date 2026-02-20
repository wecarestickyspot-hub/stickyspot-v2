import { PrismaClient } from "@prisma/client";

// 🔴 FIX 1: Edge Runtime Protection
// Prisma Rust engine Edge runtime par nahi chalta. Isse crash hone se pehle hi safety check lag jayega.
if (process.env.NEXT_RUNTIME === "edge") {
  throw new Error("❌ Prisma cannot run in Edge runtime. Ensure it's only used in Node.js environments.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 🟡 FIX 2: Advanced Query Monitoring
// Humein development mein query events chahiye taaki slow queries pakad sakein.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "query" }, // 'query' ko event ki tarah emit karo
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "warn" },
    ],
  });

// 🛡️ FIX 3: Development Singleton & Slow Query Logger
if (process.env.NODE_ENV === "development") {
  // @ts-ignore - Prisma types for $on can be tricky, but this works
  prisma.$on("query", (e: any) => {
    // Agar query 200ms se zyada time le rahi hai, toh warn karo
    if (e.duration > 200) {
      console.warn(`🐢 Slow Query (${e.duration}ms): ${e.query}`);
    } else {
      // console.log(`⚡ Query: ${e.query}`); // Optional: Saari queries dekhne ke liye
    }
  });

  // Persist instance across hot-reloads
  globalForPrisma.prisma = prisma;
}

/**
 * 💡 INFRASTRUCTURE TIP:
 * Vercel ya kisi bhi serverless environment mein traffic badhne par 
 * connection exhaustion se bachne ke liye database URL mein 
 * ?pgbouncer=true lagana ya Prisma Accelerate use karna best hai.
 */