/**
 * Type declarations for Vite environment and CSS imports.
 */

// CSS module support
declare module '*.css' {
  const content: string;
  export default content;
}

// Vite env variables
interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
