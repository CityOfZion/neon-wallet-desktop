import zod from 'zod'

export const neonBackupAccountSkinSchema = zod
  .object({
    id: zod.string(),
    type: zod.union([zod.literal('nft'), zod.literal('local'), zod.literal('color')]),
    imgUrl: zod.string().optional(),
  })
  .refine(data => (data.type === 'nft' ? !!data.imgUrl : true))

const neonBackupContactSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  addresses: zod.array(
    zod.object({
      address: zod.string(),
      blockchain: zod.string(),
    })
  ),
})

const neonBackupAccountSchema = zod.object({
  id: zod.string(),
  address: zod.string(),
  type: zod.union([zod.literal('standard'), zod.literal('watch'), zod.literal('hardware'), zod.literal('ledger')]),
  idWallet: zod.string(),
  name: zod.string(),
  blockchain: zod.string(),
  key: zod.string().optional(),
  order: zod.number(),
  skin: neonBackupAccountSkinSchema,
})

const neonBackupWalletSchema = zod.object({
  id: zod.string(),
  type: zod.union([zod.literal('standard'), zod.literal('hardware'), zod.literal('ledger')]),
  name: zod.string(),
  mnemonic: zod.string().optional(),
  accounts: zod.array(neonBackupAccountSchema),
})

const neonBackupSwapSchema = zod.object({
  account: neonBackupAccountSchema,
  txFrom: zod.string().optional(),
  txTo: zod.string().optional(),
  swapProvider: zod.literal('simpleswap'),
  swapId: zod.string().optional(),
  swapStatus: zod.any(),
  tokenFrom: zod.any(),
  tokenTo: zod.any(),
  amountFrom: zod.string(),
  amountTo: zod.string(),
  addressTo: zod.string(),
  extraIdTo: zod.string().optional(),
  fee: zod.string().optional(),
})

export const neonBackupDataSchema = zod.object({
  wallets: zod.array(neonBackupWalletSchema),
  contacts: zod.array(neonBackupContactSchema),
  swapRecords: zod.array(neonBackupSwapSchema).optional(),
})

export const neonBackupContentSchema = zod.object({
  version: zod.number(),
  data: zod.string(),
})
