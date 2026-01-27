import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  VITE_UNLIMIT_MERCHANT_ID: z.string().nonempty(),
  VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL: z.url(),
  VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL: z.url(),
  VITE_CLICK_UP_KEY: z.string().nonempty(),
  VITE_CLICK_UP_LIST_ID: z.string().nonempty(),
  VITE_CLICK_UP_ASSIGNEE_ID: z.string().nonempty(),
  VITE_GA_MEASUREMENT_ID: z.string().nonempty(),
  VITE_GA_API_SECRET: z.string().nonempty(),
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error('❌ Environment variable validation failed:')
  console.error(z.treeifyError(result.error))
  process.exit(1)
} else {
  console.log('✅ Environment variables are valid.')
}
