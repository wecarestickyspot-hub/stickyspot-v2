import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 🚨 FIX: Ignore auto-generated Prisma files so ESLint doesn't scream at you
    "app/generated/prisma/**", 
    // 💡 Optional: Agar aap shadcn/ui use kar rahe ho, toh uske generated components ko bhi ignore kar sakte ho
    // "components/ui/**",
  ]),
]);

export default eslintConfig;