// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  [
    {
      files: ["**/*.ts", "**/*.js"],
      languageOptions: {
        globals: {
          ...globals.jest,
          ...globals.node,
        },
      },
      rules: {
        "no-unused-vars": "warn",
        "no-undef": "warn",
      },
    },
  ],
  globalIgnores(["example/*", "**/*.js", "**/*.d.ts"]),
);
