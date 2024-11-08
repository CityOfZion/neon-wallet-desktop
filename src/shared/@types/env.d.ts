/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SIMPLE_SWAP_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
