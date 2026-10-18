import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 still ships eslintrc-style configs (with "extends"),
// which ESLint 9's flat config can't load directly.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Mostly in the AI adapters' response parsing; worth typing over time.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      ".next-prod/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "tmp/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "public/ocr/**",
    ],
  },
];

export default config;
