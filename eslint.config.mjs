import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // The mount-guard / script-load patterns (setState in a mount effect) are
      // idiomatic for SSR hydration here; this rule is advisory, not a bug.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // CLI scripts and config files legitimately use console for output.
    files: ["scripts/**/*.ts", "*.config.{js,mjs,ts}"],
    rules: {
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
