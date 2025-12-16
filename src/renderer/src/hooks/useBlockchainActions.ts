import { useCallback } from 'react'

import { hasWalletConnect } from '@cityofzion/blockchain-service'
import { WalletKitHelper } from '@cityofzion/bs-multichain'
import { cloneDeep } from 'lodash'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { walletKit } from '@renderer/libs/wallet-connect'
import { authReducerActions } from '@renderer/store/reducers/auth'
import { contactReducerActions } from '@renderer/store/reducers/contact'
import { utilityReducerActions } from '@renderer/store/reducers/utility'
import {
  TAccountToCreate,
  TAccountToEdit,
  TAccountToImport,
  TImportAccountsParam,
  TWalletToCreate,
  TWalletToEdit,
} from '@shared/types/blockchain'
import { IAccountState, IContactState, IWalletState } from '@shared/types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'

export function useBlockchainActions() {
  const dispatch = useAppDispatch()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('common', { keyPrefix: 'account' })

  const createContacts = (contacts: IContactState[]) =>
    contacts.forEach(contact => dispatch(contactReducerActions.saveContact(contact)))

  const createWallet = useCallback(
    ({ name, mnemonic, id, type, backupStatus }: TWalletToCreate) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      let encryptedMnemonic: string | undefined

      if (mnemonic) {
        encryptedMnemonic = window.api.sendSync('encryptBasedEncryptedSecretSync', {
          value: mnemonic,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })
      }

      const newWallet: IWalletState = {
        name,
        id: id ?? UtilsHelper.uuid(),
        encryptedMnemonic,
        type: type || 'standard',
        accounts: [],
        backupStatus: backupStatus || 'unsuccessful',
      }

      dispatch(authReducerActions.saveWallet(newWallet))

      return newWallet
    },
    [dispatch, currentLoginSessionRef]
  )

  const createStandardAccount = useCallback(
    async ({ blockchain, name, wallet, skin, id }: TAccountToCreate) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      if (!wallet.encryptedMnemonic) throw new Error('Problem to create account')

      const mnemonic = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: wallet.encryptedMnemonic,
        encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
      })

      const accountOrder = AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)
      const service = bsAggregator.blockchainServicesByName[blockchain]
      const generatedAccount = service.generateAccountFromMnemonic(mnemonic, accountOrder)

      const encryptedKey = window.api.sendSync('encryptBasedEncryptedSecretSync', {
        value: generatedAccount.key,
        encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
      })

      const newAccount: IAccountState = {
        id: id ?? UtilsHelper.uuid(),
        idWallet: wallet.id,
        name,
        blockchain,
        skin: skin ?? UtilsHelper.generateColorSkin(),
        address: generatedAccount.address,
        type: 'standard',
        encryptedKey,
        order: accountOrder,
      }

      dispatch(authReducerActions.saveAccount(newAccount))

      const firstAccount = service.generateAccountFromMnemonic(mnemonic, 0)
      dispatch(
        utilityReducerActions.saveLastIndexByWallet({
          firstAccountAddress: firstAccount.address,
          index: accountOrder,
          blockchain,
        })
      )

      return newAccount
    },
    [currentLoginSessionRef, dispatch]
  )

  const importAccount = useCallback(
    async ({ address, blockchain, type, wallet, key, name, order, skin }: TAccountToImport) => {
      let encryptedKey: string | undefined

      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      if (type === 'standard' || type === 'hardware') {
        if (!key) throw new Error('Key not defined')
        encryptedKey = await window.api.sendAsync('encryptBasedEncryptedSecret', {
          value: key,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })
      }

      const accountOrder = order ?? AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)

      const newAccount: IAccountState = {
        id: UtilsHelper.uuid(),
        idWallet: wallet.id,
        name: name ?? t('defaultName', { accountNumber: accountOrder + 1 }),
        blockchain,
        skin: skin ?? UtilsHelper.generateColorSkin(),
        address,
        type,
        encryptedKey,
        order: accountOrder,
      }

      dispatch(authReducerActions.saveAccount(newAccount))

      return newAccount
    },
    [currentLoginSessionRef, t, dispatch]
  )

  const importAccounts = useCallback(
    async ({ accounts: accountsToImport, wallet }: TImportAccountsParam) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      const clonedWallet = cloneDeep(wallet)

      for (const accountToImport of accountsToImport) {
        const account = await importAccount({ ...accountToImport, wallet: clonedWallet })

        clonedWallet.accounts = [...clonedWallet.accounts, account]
      }

      return clonedWallet.accounts
    },
    [currentLoginSessionRef, importAccount]
  )

  const deleteAccount = useCallback(
    async (account: IAccountState) => {
      dispatch(authReducerActions.deleteAccount(account))

      const service = bsAggregator.blockchainServicesByName[account.blockchain]
      if (!hasWalletConnect(service)) return

      const sessions = walletKit.getActiveSessions()
      const accountSessions = WalletKitHelper.filterSessions(Object.values(sessions), {
        addresses: [account.address],
        chains: [service.walletConnectService.chain],
      })
      await Promise.allSettled(
        accountSessions.map(session =>
          walletKit.disconnectSession({ topic: session.topic, reason: WalletKitHelper.getError('USER_DISCONNECTED') })
        )
      )
    },
    [dispatch]
  )

  const deleteWallet = useCallback(
    async (wallet: IWalletState) => {
      dispatch(authReducerActions.deleteWallet(wallet.id))

      const sessions = walletKit.getActiveSessions()

      const addresses: string[] = []
      const chains: string[] = []

      for (const account of wallet.accounts) {
        const service = bsAggregator.blockchainServicesByName[account.blockchain]
        if (!hasWalletConnect(service)) continue

        addresses.push(account.address)
        chains.push(service.walletConnectService.chain)
      }

      const accountSessions = WalletKitHelper.filterSessions(Object.values(sessions), { addresses, chains })
      await Promise.allSettled(
        accountSessions.map(session =>
          walletKit.disconnectSession({ topic: session.topic, reason: WalletKitHelper.getError('USER_DISCONNECTED') })
        )
      )
    },
    [dispatch]
  )

  const editAccount = useCallback(
    ({ account, data }: TAccountToEdit) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      let encryptedKey = account.encryptedKey

      if (data.key) {
        encryptedKey = window.api.sendSync('encryptBasedEncryptedSecretSync', {
          value: data.key,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })

        delete data.key
      }

      const editedAccount: IAccountState = Object.assign({}, account, { ...data, encryptedKey })

      dispatch(authReducerActions.saveAccount(editedAccount))

      return editedAccount
    },
    [dispatch, currentLoginSessionRef]
  )

  const editWallet = useCallback(
    ({ data, wallet }: TWalletToEdit) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      let encryptedMnemonic = wallet.encryptedMnemonic

      if (data.mnemonic) {
        encryptedMnemonic = window.api.sendSync('encryptBasedEncryptedSecretSync', {
          value: data.mnemonic,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })

        delete data.mnemonic
      }

      const editedWallet: IWalletState = Object.assign({}, wallet, { ...data, encryptedMnemonic })

      dispatch(authReducerActions.saveWallet(editedWallet))

      return editedWallet
    },
    [dispatch, currentLoginSessionRef]
  )

  return {
    createWallet,
    createStandardAccount,
    createContacts,
    importAccount,
    importAccounts,
    deleteWallet,
    deleteAccount,
    editAccount,
    editWallet,
  }
}
