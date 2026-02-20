export {};

// 🔴 FIX: Added "USER" to match our Role Hierarchy and Database structure
export type Roles = "USER" | "SUPPORT" | "ADMIN" | "SUPER_ADMIN";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}