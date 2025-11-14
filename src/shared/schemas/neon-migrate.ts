import zod from 'zod'

const neonMigrateAccountsSchema = zod.object({
  address: zod.string().nullish(),
  label: zod.string().nullish(),
  key: zod.string().nullish(),
})

const neonMigrateContactsSchema = zod.object({
  name: zod.string().nullish(),
  addresses: zod.array(zod.string()).nullish(),
})

export const neonMigrateSchema = zod.object({
  accounts: zod.array(neonMigrateAccountsSchema),
  contacts: zod.array(neonMigrateContactsSchema),
})
