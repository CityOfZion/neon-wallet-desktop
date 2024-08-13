import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { ACCOUNT_COLOR_SKINS } from '@renderer/constants/skins'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { walletReducerActions } from '@renderer/store/reducers/WalletReducer'
import {
  TAccountToCreate,
  TAccountToEdit,
  TAccountToImport,
  TImportAccountsParam,
  TWalletToCreate,
} from '@shared/@types/blockchain'
import { IAccountState, IWalletState } from '@shared/@types/store'

import { useAccountsSelector } from './useAccountSelector'
import { useAppDispatch } from './useRedux'
import { useEncryptedPasswordSelector } from './useSettingsSelector'

export function useBlockchainActions() {
  const dispatch = useAppDispatch()
  const { accountsRef } = useAccountsSelector()
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()
  const { t } = useTranslation('common', { keyPrefix: 'account' })
  const { disconnect, sessions } = useWalletConnectWallet()

  const createWallet = useCallback(
    ({ name, mnemonic, id, type = 'standard' }: TWalletToCreate) => {
      let encryptedMnemonic: string | undefined

      if (mnemonic) {
        encryptedMnemonic = window.api.sendSync('encryptBasedEncryptedSecretSync', {
          value: mnemonic,
          encryptedSecret: encryptedPasswordRef.current,
        })
      }

      const newWallet: IWalletState = {
        name,
        id: id ?? UtilsHelper.uuid(),
        encryptedMnemonic,
        type,
      }

      dispatch(walletReducerActions.saveWallet(newWallet))

      return newWallet
    },
    [dispatch, encryptedPasswordRef]
  )

  const createAccount = useCallback(
    ({ blockchain, name, wallet, skin, id }: TAccountToCreate) => {
      if (!wallet.encryptedMnemonic) throw new Error('Problem to create account')

      const mnemonic = window.api.sendSync('decryptBasedEncryptedSecretSync', {
        value: wallet.encryptedMnemonic,
        encryptedSecret: encryptedPasswordRef.current,
      })

      const generateIndex = accountsRef.current.filter(
        account => account.idWallet === wallet.id && account.blockchain === blockchain
      ).length

      const service = bsAggregator.blockchainServicesByName[blockchain]
      const generatedAccount = service.generateAccountFromMnemonic(mnemonic, generateIndex)

      const encryptedKey = window.api.sendSync('encryptBasedEncryptedSecretSync', {
        value: generatedAccount.key,
        encryptedSecret: encryptedPasswordRef.current,
      })

      const order = accountsRef.current.filter(account => account.idWallet === wallet.id).length

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
        order,
      }

      dispatch(accountReducerActions.saveAccount(newAccount))

      return newAccount
    },
    [dispatch, accountsRef, encryptedPasswordRef]
  )

  const importAccount = useCallback(
    ({ address, blockchain, type, wallet, key, name, order, skin }: TAccountToImport) => {
      let encryptedKey: string | undefined

      if (type === 'standard' || type === 'ledger') {
        if (!key) throw new Error('Key not defined')
        encryptedKey = window.api.sendSync('encryptBasedEncryptedSecretSync', {
          value: key,
          encryptedSecret: encryptedPasswordRef.current,
        })
      }

      const accountOrder = order ?? accountsRef.current.filter(account => account.idWallet === wallet.id).length

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

      dispatch(accountReducerActions.saveAccount(newAccount))
      return newAccount
    },
    [dispatch, encryptedPasswordRef, accountsRef, t]
  )

  const importAccounts = useCallback(
    async ({ accounts: accountsToImport, wallet }: TImportAccountsParam) => {
      const lastOrder = accountsRef.current.filter(account => account.idWallet === wallet.id).length

      const promises = accountsToImport.map(async (account, index) =>
        importAccount({ ...account, wallet, order: account.order ?? lastOrder + index })
      )

      return await Promise.all(promises)
    },
    [importAccount, accountsRef]
  )

  const deleteAccount = useCallback(
    async (account: IAccountState) => {
      dispatch(accountReducerActions.deleteAccount(account.id))
      await Promise.allSettled(
        sessions.map(async session => {
          const info = WalletConnectHelper.getAccountInformationFromSession(session)
          if (info.address !== account.address || info.blockchain !== account.blockchain) return

          await disconnect(session)
        })
      )
    },
    [disconnect, dispatch, sessions]
  )

  const deleteWallet = useCallback(
    async (id: string) => {
      dispatch(walletReducerActions.deleteWallet(id))
      const accounts = accountsRef.current.filter(account => account.idWallet === id)
      await Promise.allSettled(accounts.map(account => deleteAccount(account)))
    },
    [accountsRef, deleteAccount, dispatch]
  )

  const editAccount = useCallback(
    ({ account, data }: TAccountToEdit) => {
      let encryptedKey = account.encryptedKey

      if (data.type) {
        if (data.type === 'watch') {
          encryptedKey = undefined
        } else {
          if (!data.key) throw new Error('Key not defined')
          encryptedKey = window.api.sendSync('encryptBasedEncryptedSecretSync', {
            value: data.key,
            encryptedSecret: encryptedPasswordRef.current,
          })
        }
      }

      delete data.key

      const editedAccount: IAccountState = Object.assign({}, account, { ...data, encryptedKey })

      dispatch(accountReducerActions.saveAccount(editedAccount))
    },
    [dispatch, encryptedPasswordRef]
  )

  return {
    createWallet,
    createAccount,
    importAccount,
    importAccounts,
    deleteWallet,
    deleteAccount,
    editAccount,
  }
}
