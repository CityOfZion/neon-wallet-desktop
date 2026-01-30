import { useCallback } from 'react'

import { hasWalletConnect } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TUseCreateWalletParams, TUseEditWalletParams } from '@shared/types/blockchain'
import { IWalletState } from '@shared/types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'

export const useCreateWallet = () => {
  const dispatch = useAppDispatch()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('common')

  const createWallet = useCallback(
    ({ name, mnemonic, id, type, backupStatus }: TUseCreateWalletParams) => {
      if (!currentLoginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      let encryptedMnemonic: string | undefined

      if (mnemonic) {
        encryptedMnemonic = window.api.sendSync('encryption:encryptBasedEncryptedSecretSync', {
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
    [currentLoginSessionRef, dispatch, t]
  )

  return { createWallet }
}

export const useDeleteWallet = () => {
  const dispatch = useAppDispatch()

  const deleteWallet = useCallback(
    async (wallet: IWalletState) => {
      dispatch(authReducerActions.deleteWallet(wallet.id))

      const sessions = WalletKitHelper.kit.getActiveSessions()

      const addresses: string[] = []
      const chains: string[] = []

      for (const account of wallet.accounts) {
        const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
        if (!hasWalletConnect(service)) continue

        addresses.push(account.address)
        chains.push(service.walletConnectService.chain)
      }

      const accountSessions = WalletKitHelper.filterSessions(Object.values(sessions), { addresses, chains })
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

  return { deleteWallet }
}

export const useEditWallet = () => {
  const dispatch = useAppDispatch()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('common')

  const editWallet = useCallback(
    ({ data, wallet }: TUseEditWalletParams) => {
      if (!currentLoginSessionRef.current) {
        throw new AppError(t('errors.loginSessionIsNotDefined'))
      }

      let encryptedMnemonic = wallet.encryptedMnemonic

      if (data.mnemonic) {
        encryptedMnemonic = window.api.sendSync('encryption:encryptBasedEncryptedSecretSync', {
          value: data.mnemonic,
          encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
        })

        delete data.mnemonic
      }

      const editedWallet: IWalletState = Object.assign({}, wallet, { ...data, encryptedMnemonic })

      dispatch(authReducerActions.saveWallet(editedWallet))

      return editedWallet
    },
    [currentLoginSessionRef, dispatch, t]
  )

  return { editWallet }
}
