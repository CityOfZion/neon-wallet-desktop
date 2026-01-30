/* eslint-disable @typescript-eslint/no-namespace */
import { z } from 'zod'

const envSchema = z.object({
  VITE_SENTRY_DSN: z.url().nonempty().optional(),
  VITE_UNLIMIT_MERCHANT_ID: z.string().nonempty().optional(),
  VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL: z.string().nonempty().optional(),
  VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL: z.string().nonempty().optional(),
  VITE_GA_MEASUREMENT_ID: z.string().nonempty().optional(),
  VITE_GA_API_SECRET: z.string().nonempty().optional(),
  VITE_CLICK_UP_KEY: z.string().nonempty().optional(),
  VITE_CLICK_UP_LIST_ID: z.string().nonempty().optional(),
  VITE_CLICK_UP_ASSIGNEE_ID: z.string().nonempty().optional(),
})

const extendedEnvSchema = envSchema.extend({
  PROD: z.coerce.boolean(),
})

type EnvSchema = z.infer<typeof extendedEnvSchema>

class SharedEnvHelperClass {
  static schema = envSchema
  static extendedSchema = extendedEnvSchema

  static setup(): EnvSchema {
    const result = this.extendedSchema.parse(import.meta.env) as EnvSchema
    Object.assign(this, result)
    return result
  }
}

// Cast the class to include all env properties
export const SharedEnvHelper = SharedEnvHelperClass as typeof SharedEnvHelperClass & EnvSchema

export namespace SharedEnvHelper {
  export type Schema = EnvSchema
}
