import { config } from 'dotenv'
import { z } from 'zod'

import { SharedEnvHelper } from '../src/shared/helpers/SharedEnvHelper'

config()

const result = SharedEnvHelper.schema.required().safeParse(process.env)

if (!result.success) {
  console.error('❌ Environment variable validation failed:')
  console.error(z.treeifyError(result.error))
  process.exit(1)
} else {
  console.log('✅ Environment variables are valid.')
}
