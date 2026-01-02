import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  VITE_UNLIMIT_MERCHANT_ID: z.string().nonempty(),
  VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL: z.url(),
  VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL: z.url(),
})

const result = envSchema.safeParse(process.env)
if (!result.success) {
  console.error('❌ Environment variable validation failed:')
  console.error(result.error.format())
  process.exit(1)
} else {
  console.log('✅ Environment variables are valid.')
}
