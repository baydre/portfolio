import { defineConfig } from 'vitest/config'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  /*
   * The deployment root. `/` is right for `vite dev`, `vite preview` and the
   * test run; a GitHub Pages build of this repository has to be `/portfolio/`,
   * because Pages serves a project site from `https://<user>.github.io/<repo>`
   * and the repo is named `portfolio`.
   *
   * This is read from the environment rather than hardcoded so that publishing
   * to a custom domain is a one-value change in the deploy workflow — set
   * `BASE_PATH=/` and every asset URL, the router basename and the in-page
   * anchors all follow, because they all derive from this one `base`.
   *
   * Getting it wrong is not a loud failure: assets resolve to the host root and
   * 404, which looks like a blank page rather than a misconfiguration.
   */
  base: process.env.BASE_PATH ?? '/',

  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  /*
   * Tests intentionally live in this file rather than a separate
   * vitest.config.ts so that the React, Tailwind and figma:asset plugins
   * above are automatically applied to the test run as well.
   */
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
