/// <reference types="vite/client" />

/**
 * Figma Make exports assets through a custom Vite resolver (see the
 * `figmaAssetResolver` plugin in `vite.config.ts`), which maps the virtual
 * specifier `figma:asset/<file>` onto a real file in `src/assets/`.
 *
 * TypeScript has no way of knowing that mapping, so every `figma:asset/...`
 * import fails to resolve without this ambient declaration.
 */
declare module "figma:asset/*" {
  const src: string;
  export default src;
}

/**
 * Build-time configuration supplied through Vite's env handling.
 *
 * Only `VITE_`-prefixed variables reach the client bundle, and Vite inlines them
 * at build time — so these are PUBLIC values. Never put a secret here.
 */
interface ImportMetaEnv {
  /**
   * Formspree form ID for the contact form, e.g. `xpwzgkry`.
   *
   * Absent in a build that has not been configured. The form then refuses
   * submission and says why, rather than reporting a success that never
   * happened. See `src/lib/contact/index.ts` and `.env.example`.
   */
  readonly VITE_FORMSPREE_FORM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
