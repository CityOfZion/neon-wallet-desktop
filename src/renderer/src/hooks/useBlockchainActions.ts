import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { TAccountToCreate, TAccountToImport, TImportAccountsParam, TWalletToCreate } from '@renderer/@types/blockchain'
import { IAccountState, IWalletState } from '@renderer/@types/store'
import { accountColorsKeys } from '@renderer/constants/blockchain'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { walletReducerActions } from '@renderer/store/reducers/WalletReducer'
import * as uuid from 'uuid'

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
    async ({ name, walletType, mnemonic }: TWalletToCreate) => {
      let encryptedMnemonic: string | undefined

      if (walletType === 'standard') {
        if (!mnemonic) throw new Error('Standard Wallet needs to have a security phrase')

        encryptedMnemonic = await window.api.encryptBasedEncryptedSecret(mnemonic, encryptedPasswordRef.current)
      }

      const id = uuid.v4()

      const newWallet: IWalletState = {
        name,
        walletType,
        id,
        encryptedMnemonic,
      }

      dispatch(walletReducerActions.saveWallet(newWallet))

      return newWallet
    },
    [dispatch, encryptedPasswordRef]
  )

  const createAccount = useCallback(
    async ({ blockchain, name, wallet, backgroundColor }: TAccountToCreate) => {
      if (wallet.walletType !== 'standard' || !wallet.encryptedMnemonic) throw new Error('Problem to create account')

      const mnemonic = await window.api.decryptBasedEncryptedSecret(
        wallet.encryptedMnemonic,
        encryptedPasswordRef.current
      )

      const generateIndex = accountsRef.current.filter(
        account => account.idWallet === wallet.id && account.blockchain === blockchain
      ).length

      const service = bsAggregator.blockchainServicesByName[blockchain]
      const generatedAccount = service.generateAccountFromMnemonic(mnemonic, generateIndex)

      const encryptedKey = await window.api.encryptBasedEncryptedSecret(
        generatedAccount.key,
        encryptedPasswordRef.current
      )

      const order = accountsRef.current.filter(account => account.idWallet === wallet.id).length

      const newAccount: IAccountState = {
        idWallet: wallet.id,
        name,
        blockchain,
        backgroundColor: backgroundColor ? backgroundColor : accountColorsKeys[UtilsHelper.getRandomNumber(7)],
        address: generatedAccount.address,
        type: wallet.walletType,
        encryptedKey,
        order,
      }

      dispatch(accountReducerActions.saveAccount(newAccount))

      return newAccount
    },
    [dispatch, accountsRef, encryptedPasswordRef]
  )

  const importAccount = useCallback(
    async ({ address, blockchain, type, wallet, key, name, order, backgroundColor }: TAccountToImport) => {
      let encryptedKey: string | undefined

      if (type === 'standard' || type === 'legacy' || type === 'ledger') {
        if (!key) throw new Error('Key not defined')
        encryptedKey = await window.api.encryptBasedEncryptedSecret(key, encryptedPasswordRef.current)
      }

      const accountOrder = order ?? accountsRef.current.filter(account => account.idWallet === wallet.id).length

      const newAccount: IAccountState = {
        idWallet: wallet.id,
        name: name ?? t('defaultName', { accountNumber: accountOrder + 1 }),
        blockchain,
        backgroundColor: backgroundColor ?? accountColorsKeys[UtilsHelper.getRandomNumber(7)],
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

      const promises = accountsToImport.map((account, index) =>
        importAccount({ ...account, wallet, order: account.order ?? lastOrder + index })
      )

      return await Promise.all(promises)
    },
    [importAccount, accountsRef]
  )

  const deleteAccount = useCallback(
    async (address: string) => {
      dispatch(accountReducerActions.deleteAccount(address))
      await Promise.allSettled(
        sessions.map(async session => {
          const info = WalletConnectHelper.getAccountInformationFromSession(session)
          if (info.address !== address) return

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
      await Promise.allSettled(accounts.map(account => deleteAccount(account.address)))
    },
    [accountsRef, deleteAccount, dispatch]
  )

  return {
    createWallet,
    createAccount,
    importAccount,
    importAccounts,
    deleteWallet,
    deleteAccount,
  }
}
