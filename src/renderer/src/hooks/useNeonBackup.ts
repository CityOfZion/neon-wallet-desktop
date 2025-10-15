import { useTranslation } from 'react-i18next'
import { BACKUP_FILE_EXTENSION, BACKUP_VERSION, DEPRECATED_BACKUP_FILE_EXTENSION } from '@renderer/constants/backup'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { doesBlockchainSupported } from '@renderer/libs/blockchainService'
import { contactReducerActions } from '@renderer/store/reducers/ContactReducer'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TAccountsToImport, TCreateWalletAndAccountParam } from '@shared/@types/blockchain'
import {
  IAccountState,
  IContactState,
  IWalletState,
  TAccountType,
  TContactAddress,
  TMigrationsNeo3,
  TSkin,
  TSwapRecord,
} from '@shared/@types/store'
import { cloneDeep } from 'lodash'
import zod from 'zod'

import { useAccountsSelector, useAccountUtils } from './useAccountSelector'
import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useContactsSelector } from './useContactSelector'
import { useAppDispatch } from './useRedux'
import { useMigrationsNeo3Selector, useSwapRecordsSelector } from './useUtilitySelector'
import { useWalletsSelector } from './useWalletSelector'

export type TUseNeonBackupSchema = zod.infer<typeof backupFileSchema>
export type TUseNeonBackupDataSchema = zod.infer<typeof backupDataSchema>
export type TUseNeonBackupData = { content: TUseNeonBackupSchema; type: 'backup' }
export type TUseNeonBackupDeprecatedData = { content: string; type: 'backup-deprecated' }

export type TUseNeonBackupGeneratedData = {
  wallets: TCreateWalletAndAccountParam[]
  swapRecords?: TSwapRecord[]
  migrationsNeo3?: TMigrationsNeo3
  contacts?: IContactState[]
}

export const backupAccountSkinSchema = zod
  .object({
    id: zod.string(),
    type: zod.union([zod.literal('nft'), zod.literal('local'), zod.literal('color')]),
    imgUrl: zod.string().optional(),
  })
  .refine(data => (data.type === 'nft' ? !!data.imgUrl : true))

export const backupAccountSchema = zod.object({
  id: zod.string(),
  address: zod.string(),
  type: zod.union([zod.literal('standard'), zod.literal('watch'), zod.literal('hardware'), zod.literal('ledger')]),
  idWallet: zod.string(),
  name: zod.string(),
  blockchain: zod.string(),
  key: zod.string().optional(),
  order: zod.number(),
  skin: backupAccountSkinSchema,
})

export const backupWalletSchema = zod.object({
  id: zod.string(),
  type: zod.union([zod.literal('standard'), zod.literal('hardware'), zod.literal('ledger')]),
  name: zod.string(),
  mnemonic: zod.string().optional(),
  accounts: zod.array(backupAccountSchema),
})

export const backupContactSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  addresses: zod.array(
    zod.object({
      address: zod.string(),
      blockchain: zod.string(),
    })
  ),
})

export const backupSwapSchema = zod.object({
  account: backupAccountSchema,
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

const backupTokenSchema = zod.object({
  symbol: zod.string(),
  name: zod.string(),
  hash: zod.string(),
  decimals: zod.number(),
})

const backupBalanceSchema = zod.object({
  token: backupTokenSchema,
  amount: zod.string(),
})

const backupMigrationsNeo3Schema = zod.record(
  zod.string(),
  zod.object({
    hash: zod.string(),
    neoLegacyAccount: backupAccountSchema,
    neo3Address: zod.string(),
    status: zod.union([
      zod.literal('failure'),
      zod.literal('pending'),
      zod.literal('done'),
      zod.literal('failure-neo3'),
    ]),
    neo3MigrationAmounts: zod.object({
      gasMigrationTotalFees: zod.string().optional(),
      neoMigrationTotalFees: zod.string().optional(),
      gasMigrationReceiveAmount: zod.string().optional(),
      neoMigrationReceiveAmount: zod.string().optional(),
    }),
    neoLegacyMigrationAmounts: zod.object({
      hasEnoughGasBalance: zod.boolean(),
      hasEnoughNeoBalance: zod.boolean(),
      gasBalance: backupBalanceSchema.optional(),
      neoBalance: backupBalanceSchema.optional(),
    }),
  })
)

export const backupDataSchema = zod.object({
  wallets: zod.array(backupWalletSchema),
  contacts: zod.array(backupContactSchema),
  swapRecords: zod.array(backupSwapSchema).optional(),
  migrationsNeo3: backupMigrationsNeo3Schema.optional(),
})

export const backupFileSchema = zod.object({
  version: zod.number(),
  data: zod.string(),
})

const fixAccountProperties = (
  backupAccount: zod.infer<typeof backupAccountSchema>
): Omit<IAccountState, 'encryptedKey'> | undefined => {
  if (!doesBlockchainSupported(backupAccount.blockchain)) return

  const type: TAccountType =
    backupAccount.type === 'ledger' || backupAccount.type === 'hardware' ? 'watch' : backupAccount.type

  if (!backupAccount.skin || UtilsHelper.isHexadecimal(backupAccount.skin.id)) {
    backupAccount.skin = UtilsHelper.generateColorSkin()
  }

  return {
    address: backupAccount.address,
    blockchain: backupAccount.blockchain,
    id: backupAccount.id,
    idWallet: backupAccount.idWallet,
    name: backupAccount.name,
    order: backupAccount.order,
    skin: backupAccount.skin as TSkin,
    type,
  }
}

const fixWalletProperties = (
  backupWallet: zod.infer<typeof backupWalletSchema>
): Omit<IWalletState, 'accounts' | 'encryptedMnemonic' | 'backupStatus'> => {
  const type = backupWallet.type === 'ledger' ? 'hardware' : backupWallet.type

  return {
    id: backupWallet.id,
    name: backupWallet.name,
    type,
  }
}

export const useNeonCreateBackup = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useNeonBackup' })
  const { swapRecords } = useSwapRecordsSelector()
  const { migrationsNeo3 } = useMigrationsNeo3Selector()
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const { contacts } = useContactsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { editWallet } = useBlockchainActions()

  const handleCreateBackupFormat = async () => {
    if (!currentLoginSessionRef.current) {
      throw new Error(t('errors.unexpectedError'))
    }

    const encryptedPassword = currentLoginSessionRef.current.encryptedPassword

    const backupFile: zod.infer<typeof backupDataSchema> = {
      wallets: [],
      contacts: [],
      swapRecords: [],
      migrationsNeo3: {},
    }

    backupFile.contacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      addresses: contact.addresses.map(address => ({ address: address.address, blockchain: address.blockchain })),
    }))

    backupFile.swapRecords = swapRecords.map(swap => ({
      account: swap.account,
      swapId: swap.swapId,
      addressTo: swap.addressTo,
      extraIdTo: swap.extraIdTo,
      amountFrom: swap.amountFrom,
      amountTo: swap.amountTo,
      swapProvider: swap.swapProvider,
      swapStatus: swap.swapStatus,
      tokenFrom: swap.tokenFrom,
      tokenTo: swap.tokenTo,
      fee: swap.fee,
      txFrom: swap.txFrom,
      txTo: swap.txTo,
    }))

    backupFile.migrationsNeo3 = cloneDeep(migrationsNeo3)

    const backupAccountsByWalletId = new Map<string, zod.infer<typeof backupAccountSchema>[]>()

    const accountPromises = accounts.map(async account => {
      let key: string | undefined

      if (account.encryptedKey) {
        key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: account.encryptedKey,
          encryptedSecret: encryptedPassword,
        })
      }

      const backupAccount: zod.infer<typeof backupAccountSchema> = {
        id: account.id,
        idWallet: account.idWallet,
        address: account.address,
        blockchain: account.blockchain,
        name: account.name,
        order: account.order,
        type: account.type,
        key: key ?? undefined,
        skin: account.skin,
      }

      const walletAccounts = backupAccountsByWalletId.get(backupAccount.idWallet) ?? []

      backupAccountsByWalletId.set(backupAccount.idWallet, [...walletAccounts, backupAccount])
    })

    await Promise.all(accountPromises)

    const promises = wallets.map(async wallet => {
      let mnemonic: string | undefined

      if (wallet.encryptedMnemonic) {
        mnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: wallet.encryptedMnemonic,
          encryptedSecret: encryptedPassword,
        })
      }

      const walletAccounts = backupAccountsByWalletId.get(wallet.id) ?? []

      backupFile.wallets.push({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        mnemonic: mnemonic ?? undefined,
        accounts: walletAccounts,
      })
    })

    await Promise.all(promises)

    return backupFile
  }

  const handleCreateBackup = async (password: string, selectedFilePath: string) => {
    try {
      const backupFileData = await handleCreateBackupFormat()
      const backupFileDataString = JSON.stringify(backupFileData)

      const backupFileDataStringEncrypted = await window.api.sendAsync('encryptBasedSecret', {
        value: backupFileDataString,
        secret: password,
        options: { algorithm: 'pbkdf2' },
      })

      const backupFile: zod.infer<typeof backupFileSchema> = {
        version: BACKUP_VERSION,
        data: backupFileDataStringEncrypted,
      }

      backupFileData.wallets.forEach(({ id }) => {
        const wallet = wallets.find(wallet => wallet.id === id)

        if (wallet) editWallet({ wallet, data: { backupStatus: 'successful' } })
      })

      await window.api.sendAsync('saveFile', {
        path: `${selectedFilePath}/Neon-Backup-${DateHelper.getNowUnix()}.${BACKUP_FILE_EXTENSION}`,
        content: JSON.stringify(backupFile),
      })
    } catch {
      throw new Error(t('errors.backupError'))
    }
  }

  return {
    handleCreateBackup,
  }
}

export const useNeonImportBackup = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useNeonImportBackup' })
  const dispatch = useAppDispatch()
  const { createWallet, importAccounts } = useBlockchainActions()
  const { doesAccountExist } = useAccountUtils()

  const validateAndParseFile = async (
    filePath: string,
    fileContent: string
  ): Promise<TUseNeonBackupData | TUseNeonBackupDeprecatedData | undefined> => {
    try {
      if (filePath.endsWith(BACKUP_FILE_EXTENSION)) {
        const backupFile = JSON.parse(fileContent)
        const validatedFile = await backupFileSchema.parseAsync(backupFile)

        if (validatedFile.version !== BACKUP_VERSION) {
          return undefined
        }

        return { type: 'backup', content: validatedFile }
      }
    } catch {
      /* empty */
    }

    if (filePath.endsWith(DEPRECATED_BACKUP_FILE_EXTENSION)) {
      return { type: 'backup-deprecated', content: fileContent }
    }

    return undefined
  }

  const handleTryDecryptData = async (
    data: TUseNeonBackupData | TUseNeonBackupDeprecatedData,
    password: string
  ): Promise<TUseNeonBackupDataSchema> => {
    try {
      let decrypted: string

      if (data.type === 'backup-deprecated') {
        decrypted = await window.api.sendAsync('decryptBasedSecret', { value: data.content, secret: password })
      } else {
        decrypted = await window.api.sendAsync('decryptBasedSecret', {
          value: data.content.data,
          secret: password,
          options: { algorithm: 'pbkdf2' },
        })
      }

      const parsedData = JSON.parse(decrypted)

      return await backupDataSchema.parseAsync(parsedData)
    } catch {
      throw new Error(t('errors.wrongPassword'))
    }
  }

  const handleGenerateData = (data: zod.infer<typeof backupDataSchema>): TUseNeonBackupGeneratedData => {
    const contactsToCreate: IContactState[] = []
    const swapRecordsToCreate: TSwapRecord[] = []
    const migrationsNeo3ToCreate: TMigrationsNeo3 = {}
    const walletsToCreate: TCreateWalletAndAccountParam[] = []

    data.swapRecords?.forEach(swap => {
      const account = fixAccountProperties(swap.account)
      if (!account) return

      swapRecordsToCreate.push({
        addressTo: swap.addressTo,
        extraIdTo: swap.extraIdTo,
        amountFrom: swap.amountFrom,
        amountTo: swap.amountTo,
        fee: swap.fee,
        swapId: swap.swapId,
        swapProvider: swap.swapProvider,
        tokenFrom: swap.tokenFrom,
        tokenTo: swap.tokenTo,
        txFrom: swap.txFrom,
        swapStatus: swap.swapStatus,
        txTo: swap.txTo,
        account,
      })
    })

    if (data.migrationsNeo3) {
      Object.assign(
        migrationsNeo3ToCreate,
        Object.values(data.migrationsNeo3).reduce((migrationsNeo3, migrationNeo3) => {
          const account = fixAccountProperties(migrationNeo3.neoLegacyAccount)

          if (!account) return migrationsNeo3

          return {
            ...migrationsNeo3,
            [migrationNeo3.hash]: {
              ...migrationNeo3,
              account,
            },
          }
        }, {})
      )
    }

    data.contacts.forEach(contact => {
      const addresses: TContactAddress[] = []

      contact.addresses.forEach(address => {
        if (!doesBlockchainSupported(address.blockchain)) return

        addresses.push({ address: address.address, blockchain: address.blockchain })
      })

      contactsToCreate.push({
        id: contact.id,
        name: contact.name,
        addresses,
      })
    })

    data.wallets.map(backupWallet => {
      const accountsToImport: TAccountsToImport = []

      backupWallet.accounts.forEach(backupAccount => {
        const fixedAccount = fixAccountProperties(backupAccount)

        if (!fixedAccount || doesAccountExist(fixedAccount)) return

        accountsToImport.push({ ...fixedAccount, key: backupAccount.key })
      })

      if (accountsToImport.length === 0) return

      const fixedWallet = fixWalletProperties(backupWallet)

      walletsToCreate.push({
        ...fixedWallet,
        backupStatus: 'successful',
        mnemonic: backupWallet.mnemonic,
        accounts: accountsToImport,
      })
    })

    return {
      wallets: walletsToCreate,
      contacts: contactsToCreate,
      swapRecords: swapRecordsToCreate,
      migrationsNeo3: migrationsNeo3ToCreate,
    }
  }

  const handleImportBackupData = async (generatedData: TUseNeonBackupGeneratedData) => {
    try {
      generatedData.swapRecords?.forEach(swap => {
        dispatch(utilityReducerActions.persistSwapRecord(swap))
      })

      if (generatedData.migrationsNeo3) {
        dispatch(utilityReducerActions.mergeMigrationsNeo3(generatedData.migrationsNeo3))
      }

      generatedData.contacts?.forEach(contact => {
        dispatch(contactReducerActions.saveContact(contact))
      })

      const promises = generatedData.wallets.map(async walletData => {
        const newWallet = createWallet(walletData)

        await importAccounts({ wallet: newWallet, accounts: walletData.accounts })
      })

      await Promise.allSettled(promises)
    } catch {
      throw new Error(t('errors.importData'))
    }
  }

  return {
    validateAndParseFile,
    handleImportBackupData,
    handleTryDecryptData,
    handleGenerateData,
  }
}
