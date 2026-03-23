import { useTranslation } from 'react-i18next'
import zod from 'zod'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { NeonBackupHelper } from '@renderer/helpers/NeonBackupHelper'

import { contactReducerActions } from '@renderer/store/reducers/contact'
import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { neonBackupContentSchema, neonBackupDataSchema } from '@shared/schemas/neon-backup'
import { TAccountsToImport, TCreateWalletAndAccountParam } from '@shared/types/blockchain'
import type {
  TUseNeonBackupAccount,
  TUseNeonBackupData,
  TUseNeonBackupDataSchema,
  TUseNeonBackupDeprecatedData,
  TUseNeonBackupGeneratedData,
} from '@shared/types/hooks'
import { IContactState, TContactAddress, TSwapRecord } from '@shared/types/store'

import { useImportAccounts } from './useAccountActions'
import { useAccountsSelector, useAccountUtils } from './useAccountSelector'
import { useLoginSessionSelector } from './useAuthSelector'
import { useContactsSelector } from './useContactSelector'
import { useAppDispatch } from './useRedux'
import { useSwapRecordsSelector } from './useUtilitySelector'
import { useCreateWallet, useEditWallet } from './useWalletActions'
import { useWalletsSelector } from './useWalletSelector'

export const useNeonCreateBackup = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useNeonBackup' })
  const { swapRecords } = useSwapRecordsSelector()
  const { wallets } = useWalletsSelector()
  const { accounts } = useAccountsSelector()
  const { contacts } = useContactsSelector()
  const { loginSessionRef } = useLoginSessionSelector()
  const { editWallet } = useEditWallet()

  const handleCreateBackupFormat = async () => {
    if (!loginSessionRef.current) {
      throw new AppError(t('errors.unexpectedError'))
    }

    const encryptedPassword = loginSessionRef.current.encryptedPassword

    const backupFile: zod.infer<typeof neonBackupDataSchema> = {
      wallets: [],
      contacts: [],
      swapRecords: [],
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

    const backupAccountsByWalletId = new Map<string, TUseNeonBackupAccount[]>()

    const accountPromises = accounts.map(async account => {
      let key: string | undefined

      if (account.encryptedKey) {
        key = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
          value: account.encryptedKey,
          encryptedSecret: encryptedPassword,
        })
      }

      const backupAccount: TUseNeonBackupAccount = {
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
        mnemonic = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
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

      const backupFileDataStringEncrypted = await window.api.sendAsync('encryption:encryptBasedSecret', {
        value: backupFileDataString,
        secret: password,
        options: { algorithm: 'pbkdf2' },
      })

      const backupFile: zod.infer<typeof neonBackupContentSchema> = {
        version: NeonBackupHelper.backupVersion,
        data: backupFileDataStringEncrypted,
      }

      backupFileData.wallets.forEach(({ id }) => {
        const wallet = wallets.find(wallet => wallet.id === id)

        if (wallet) editWallet({ wallet, data: { backupStatus: 'successful' } })
      })

      await window.api.sendAsync('window:saveFile', {
        path: `${selectedFilePath}/Neon-Backup-${DateHelper.getCurrentFullDateString()}.${NeonBackupHelper.fileExtension}`,
        content: JSON.stringify(backupFile),
      })
    } catch (error) {
      throw AppError.wrap(error, t('errors.backupError'))
    }
  }

  return {
    handleCreateBackup,
  }
}

export const useNeonImportBackup = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useNeonImportBackup' })
  const dispatch = useAppDispatch()
  const { importAccounts } = useImportAccounts()
  const { createWallet } = useCreateWallet()
  const { doesAccountExist } = useAccountUtils()

  const validateAndParseFile = async (
    filePath: string,
    fileContent: string
  ): Promise<TUseNeonBackupData | TUseNeonBackupDeprecatedData | undefined> => {
    try {
      if (filePath.endsWith(NeonBackupHelper.fileExtension)) {
        const backupFile = JSON.parse(fileContent)
        const validatedFile = await neonBackupContentSchema.parseAsync(backupFile)

        if (validatedFile.version !== NeonBackupHelper.backupVersion) {
          return undefined
        }

        return { type: 'backup', content: validatedFile }
      }
    } catch {
      /* empty */
    }

    if (filePath.endsWith(NeonBackupHelper.deprecatedFileExtension)) {
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
        decrypted = await window.api.sendAsync('encryption:decryptBasedSecret', {
          value: data.content,
          secret: password,
        })
      } else {
        decrypted = await window.api.sendAsync('encryption:decryptBasedSecret', {
          value: data.content.data,
          secret: password,
          options: { algorithm: 'pbkdf2' },
        })
      }

      const parsedData = JSON.parse(decrypted)

      return await neonBackupDataSchema.parseAsync(parsedData)
    } catch (error) {
      throw AppError.wrap(error, t('errors.wrongPassword'))
    }
  }

  const handleGenerateData = (data: zod.infer<typeof neonBackupDataSchema>): TUseNeonBackupGeneratedData => {
    const contactsToCreate: IContactState[] = []
    const swapRecordsToCreate: TSwapRecord[] = []
    const walletsToCreate: TCreateWalletAndAccountParam[] = []

    data.swapRecords?.forEach(swap => {
      const account = NeonBackupHelper.fixAccountProperties(swap.account)
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

    data.contacts.forEach(contact => {
      const addresses: TContactAddress[] = []

      contact.addresses.forEach(address => {
        if (!BlockchainServiceHelper.doesBlockchainSupported(address.blockchain)) return

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
        const fixedAccount = NeonBackupHelper.fixAccountProperties(backupAccount)

        if (!fixedAccount || doesAccountExist(fixedAccount)) return

        accountsToImport.push({ ...fixedAccount, key: backupAccount.key })
      })

      if (accountsToImport.length === 0) return

      const fixedWallet = NeonBackupHelper.fixWalletProperties(backupWallet)

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
    }
  }

  const handleImportBackupData = async (generatedData: TUseNeonBackupGeneratedData) => {
    try {
      generatedData.swapRecords?.forEach(swap => {
        dispatch(utilityReducerActions.persistSwapRecord(swap))
      })

      generatedData.contacts?.forEach(contact => {
        dispatch(contactReducerActions.saveContact(contact))
      })

      const promises = generatedData.wallets.map(async walletData => {
        const newWallet = createWallet(walletData)

        await importAccounts({ wallet: newWallet, accounts: walletData.accounts })
      })

      await Promise.allSettled(promises)
    } catch (error) {
      throw AppError.wrap(error, t('errors.importData'))
    }
  }

  return {
    validateAndParseFile,
    handleImportBackupData,
    handleTryDecryptData,
    handleGenerateData,
  }
}
