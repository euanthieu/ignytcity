import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import("eslint").Linter.FlatConfig[]} */
const eslintConfig = [
  // Extend Next.js recommended configs via FlatCompat bridge
  ...compat.extends("next/core-web-vitals"),

  // Ignore build output
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },

  // === FAOS Boundary Enforcement ===

  // Rule 1: Features cannot import from OTHER features.
  // Pattern targets: @/features/<any-feature>/<any-subdir> but must not match
  // the same feature. We block the common cross-feature access patterns explicitly.
  {
    files: ["src/features/auth/**/*.ts", "src/features/auth/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/users/**"],
              message:
                "Strict Boundary Violation: auth/ cannot import from users/. Compose at app/ level.",
            },
            {
              group: ["@/features/posts/**"],
              message:
                "Strict Boundary Violation: auth/ cannot import from posts/. Compose at app/ level.",
            },
            {
              group: ["@/features/dashboard/**"],
              message:
                "Strict Boundary Violation: auth/ cannot import from dashboard/. Compose at app/ level.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/users/**/*.ts", "src/features/users/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/auth/**"],
              message:
                "Strict Boundary Violation: users/ cannot import from auth/. Compose at app/ level.",
            },
            {
              group: ["@/features/posts/**"],
              message:
                "Strict Boundary Violation: users/ cannot import from posts/. Compose at app/ level.",
            },
            {
              group: ["@/features/dashboard/**"],
              message:
                "Strict Boundary Violation: users/ cannot import from dashboard/. Compose at app/ level.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/posts/**/*.ts", "src/features/posts/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/auth/**"],
              message:
                "Strict Boundary Violation: posts/ cannot import from auth/. Compose at app/ level.",
            },
            {
              group: ["@/features/users/**"],
              message:
                "Strict Boundary Violation: posts/ cannot import from users/. Compose at app/ level.",
            },
            {
              group: ["@/features/dashboard/**"],
              message:
                "Strict Boundary Violation: posts/ cannot import from dashboard/. Compose at app/ level.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/features/dashboard/**/*.ts",
      "src/features/dashboard/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/auth/**"],
              message:
                "Strict Boundary Violation: dashboard/ cannot import from auth/. Compose at app/ level.",
            },
            {
              group: ["@/features/users/**"],
              message:
                "Strict Boundary Violation: dashboard/ cannot import from users/. Compose at app/ level.",
            },
            {
              group: ["@/features/posts/**"],
              message:
                "Strict Boundary Violation: dashboard/ cannot import from posts/. Compose at app/ level.",
            },
          ],
        },
      ],
    },
  },

  // Rule 2: The shared/ kernel cannot import from features/ or app/.
  {
    files: ["src/shared/**/*.ts", "src/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**", "@/app/**"],
              message:
                "Strict Boundary Violation: The shared/ kernel cannot import from features/ or app/. It must be pure infrastructure.",
            },
          ],
        },
      ],
    },
  },

  // Rule 3: The app/ layer cannot use React Query directly.
  {
    files: ["src/app/**/*.ts", "src/app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@tanstack/react-query"],
              message:
                "Strict Boundary Violation: The app/ layer cannot fetch data directly. Compose feature views instead.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
