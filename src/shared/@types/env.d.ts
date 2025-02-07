/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_UNLIMIT_MERCHANT_ID: string
  readonly VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL: string
  readonly VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
