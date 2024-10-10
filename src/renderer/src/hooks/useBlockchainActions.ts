import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { ACCOUNT_COLOR_SKINS } from '@renderer/constants/skins'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { contactReducerActions } from '@renderer/store/reducers/ContactReducer'
import {
  TAccountToCreate,
  TAccountToEdit,
  TAccountToImport,
  TImportAccountsParam,
  TWalletToCreate,
  TWalletToEdit,
} from '@shared/@types/blockchain'
import { IAccountState, IContactState, IWalletState } from '@shared/@types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'

export function useBlockchainActions() {
  const dispatch = useAppDispatch()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('common', { keyPrefix: 'account' })
  const { disconnect, sessions } = useWalletConnectWallet()

  const createContacts = (contacts: IContactState[]) =>
    contacts.forEach(contact => dispatch(contactReducerActions.saveContact(contact)))

  const createWallet = useCallback(
    ({ name, mnemonic, id, type = 'standard' }: TWalletToCreate) => {
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
        type,
        accounts: [],
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

      const accountOrder = UtilsHelper.getNextNumberOrMissing(wallet.accounts.map(account => account.order))
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
        skin: skin ?? { type: 'color', id: ACCOUNT_COLOR_SKINS[UtilsHelper.getRandomNumber(7)].id },
        lastNftSkin: skin?.type === 'nft' ? skin : undefined,
        address: generatedAccount.address,
        type: 'standard',
        encryptedKey,
        order: accountOrder,
      }

      dispatch(authReducerActions.saveAccount(newAccount))

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

      const accountOrder = order ?? UtilsHelper.getNextNumberOrMissing(wallet.accounts.map(account => account.order))

      const newAccount: IAccountState = {
        id: UtilsHelper.uuid(),
        idWallet: wallet.id,
        name: name ?? t('defaultName', { accountNumber: accountOrder + 1 }),
        blockchain,
        skin: skin ?? { type: 'color', id: ACCOUNT_COLOR_SKINS[UtilsHelper.getRandomNumber(7)].id },
        lastNftSkin: skin?.type === 'nft' ? skin : undefined,
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

      const accounts: IAccountState[] = []

      for (const accountToImport of accountsToImport) {
        const account = await importAccount({ ...accountToImport, wallet })

        accounts.push(account)
      }

      return accounts
    },
    [currentLoginSessionRef, importAccount]
  )

  const deleteAccount = useCallback(
    async (account: IAccountState) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      dispatch(authReducerActions.deleteAccount(account))

      await Promise.allSettled(
        sessions.map(async session => {
          const info = WalletConnectHelper.getAccountInformationFromSession(session)
          if (info.address !== account.address || info.blockchain !== account.blockchain) return

          await disconnect(session)
        })
      )
    },
    [currentLoginSessionRef, disconnect, dispatch, sessions]
  )

  const deleteWallet = useCallback(
    (walletId: string) => {
      dispatch(authReducerActions.deleteWallet(walletId))
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
