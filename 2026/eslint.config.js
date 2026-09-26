import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Build output and dependencies are never linted.
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    /*
     * src/imports/ is Figma Make *generated reference code*.
     *
     * It is a frozen record of what the Figma export produced, not application
     * code we maintain. It is deliberately excluded from linting and typechecking
     * so that generated style patterns (e.g. Figma layer names used as component
     * names, CSS custom properties set inline) do not block work on real code.
     *
     * It will be replaced, selectively migrated, or removed once the
     * authoritative Figma snippets are available.
     * See docs/FIGMA_IMPLEMENTATION.md and AGENTS.md.
     */
    ignores: ["src/imports/**"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    /*
     * scripts/ holds Node tooling, not application code, so it needs the Node
     * globals declared rather than the browser ones. `no-undef` stays on:
     * typescript-eslint disables it for .ts/.tsx (the type system covers that
     * ground), so a plain .mjs script would otherwise report every global.
     * Declared by hand to avoid adding the `globals` package for three names.
     */
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  },
  {
    files: ["*.js", "eslint.config.js", "postcss.config.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
);
