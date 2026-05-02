import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "src/components/ui/**",
      "src/hooks/**",
      "src/data/**",
      "src/test/**",
      "src/pages/**",
      "src/App.tsx",
      "src/main.tsx",
      "tailwind.config.ts",
      "vite.config.ts",
      "vitest.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "no-console": ["warn", { "allow": ["warn", "error"] }]
    },
  },
];
