import zod from 'zod'

const nep6BackupAccountSchema = zod.object({
  address: zod.string(),
  label: zod.string().nullish(),
  key: zod.string().nullish(),
})

export const nep6BackupSchema = zod.object({
  version: zod.string(),
  scrypt: zod.looseObject({}),
  accounts: zod.array(nep6BackupAccountSchema).nonempty(),
})
