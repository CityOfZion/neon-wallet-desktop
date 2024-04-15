/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly MAIN_VITE_BITQUERY_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
