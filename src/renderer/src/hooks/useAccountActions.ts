import { useCallback } from 'react'

import { hasWalletConnect } from '@cityofzion/blockchain-service'
import cloneDeep from 'lodash/cloneDeep'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { SkinHelper } from '@renderer/helpers/SkinHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import {
  TUseCreateStandardAccountParams,
  TUseEditAccountParams,
  TUseImportAccountParams,
  TUseImportAccountsParams,
} from '@shared/types/blockchain'
import { TAccount } from '@shared/types/store'

import { useLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'

export const useCreateStandardAccount = () => {
  const dispatch = useAppDispatch()
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('common')

  const createStandardAccount = useCallback(
    async ({ blockchain, name, wallet, skin, id }: TUseCreateStandardAccountParams) => {
      if (!loginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      if (!wallet.encryptedMnemonic) {
        throw new AppError(t('errors.unexpectedError'))
      }

      const mnemonic = await window.api.sendAsync('encryption:decryptBasedEncryptedSecret', {
        value: wallet.encryptedMnemonic,
        encryptedSecret: loginSessionRef.current.encryptedPassword,
      })

      const accountOrder = AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
      const generatedAccount = await service.generateAccountFromMnemonic(mnemonic, accountOrder)

      const encryptedKey = window.api.sendSync('encryption:encryptBasedEncryptedSecretSync', {
        value: generatedAccount.key,
        encryptedSecret: loginSessionRef.current.encryptedPassword,
      })

      const newAccount: TAccount = {
        id: id || UtilsHelper.uuid(),
        idWallet: wallet.id,
        name,
        blockchain,
        skin: skin || SkinHelper.generateColorSkin(),
        address: generatedAccount.address,
        type: 'standard',
        encryptedKey,
        order: accountOrder,
      }

      dispatch(authReducerActions.saveAccount(newAccount))

      const firstAccount = await service.generateAccountFromMnemonic(mnemonic, 0)
      dispatch(
        utilityReducerActions.saveLastIndexByWallet({
          firstAccountAddress: firstAccount.address,
          index: accountOrder,
          blockchain,
        })
      )

      return newAccount
    },
    [loginSessionRef, dispatch, t]
  )

  return { createStandardAccount }
}

export const useImportAccount = () => {
  const dispatch = useAppDispatch()
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('common')

  const importAccount = useCallback(
    async ({ address, blockchain, type, wallet, key, name, order, skin }: TUseImportAccountParams) => {
      let encryptedKey: string | undefined

      if (!loginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      if (type === 'standard' || type === 'hardware') {
        if (!key) {
          throw new AppError(t('errors.unexpectedError'))
        }

        encryptedKey = await window.api.sendAsync('encryption:encryptBasedEncryptedSecret', {
          value: key,
          encryptedSecret: loginSessionRef.current.encryptedPassword,
        })
      }

      const accountOrder = order ?? AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)

      const newAccount: TAccount = {
        id: UtilsHelper.uuid(),
        idWallet: wallet.id,
        name: name || t('account.defaultName', { accountNumber: accountOrder + 1 }),
        blockchain,
        skin: skin || SkinHelper.generateColorSkin(),
        address,
        type,
        encryptedKey,
        order: accountOrder,
      }

      dispatch(authReducerActions.saveAccount(newAccount))

      return newAccount
    },
    [loginSessionRef, t, dispatch]
  )

  return { importAccount }
}

export const useImportAccounts = () => {
  const { importAccount } = useImportAccount()
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('common')

  const importAccounts = useCallback(
    async ({ accounts: accountsToImport, wallet }: TUseImportAccountsParams) => {
      if (!loginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      const clonedWallet = cloneDeep(wallet)

      for (const accountToImport of accountsToImport) {
        const account = await importAccount({ ...accountToImport, wallet: clonedWallet })

        clonedWallet.accounts = [...clonedWallet.accounts, account]
      }

      return clonedWallet.accounts
    },
    [loginSessionRef, importAccount, t]
  )

  return { importAccounts }
}

export const useDeleteAccount = () => {
  const dispatch = useAppDispatch()

  const deleteAccount = useCallback(
    async (account: TAccount) => {
      dispatch(authReducerActions.deleteAccount(account))

      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
      if (!hasWalletConnect(service)) return

      const sessions = WalletKitHelper.kit.getActiveSessions()
      const accountSessions = WalletKitHelper.filterSessions(Object.values(sessions), {
        addresses: [account.address],
        chains: [service.walletConnectService.chain],
      })
      await Promise.allSettled(
        accountSessions.map(session =>
          WalletKitHelper.kit.disconnectSession({
            topic: session.topic,
            reason: WalletKitHelper.getError('USER_DISCONNECTED'),
          })
        )
      )
    },
    [dispatch]
  )
  return { deleteAccount }
}

export const useEditAccount = () => {
  const dispatch = useAppDispatch()
  const { loginSessionRef } = useLoginSessionSelector()
  const { t } = useTranslation('common')

  const editAccount = useCallback(
    ({ account, data }: TUseEditAccountParams) => {
      if (!loginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      let encryptedKey = account.encryptedKey

      if (data.key) {
        encryptedKey = window.api.sendSync('encryption:encryptBasedEncryptedSecretSync', {
          value: data.key,
          encryptedSecret: loginSessionRef.current.encryptedPassword,
        })

        delete data.key
      }

      const editedAccount: TAccount = Object.assign({}, account, { ...data, encryptedKey })

      dispatch(authReducerActions.saveAccount(editedAccount))

      return editedAccount
    },
    [loginSessionRef, dispatch, t]
  )

  return { editAccount }
}
