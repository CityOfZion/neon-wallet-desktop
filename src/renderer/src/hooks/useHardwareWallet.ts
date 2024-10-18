import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { MnemonicHelper } from '@renderer/helpers/MnemonicHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { THardwareWalletInfo } from '@shared/@types/ipc'
import { IWalletState } from '@shared/@types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useMountUnsafe } from './useMount'
import { useWalletsSelector } from './useWalletSelector'

type TStatus = 'searching' | 'connected' | 'not-connected'

const MAX_ATTEMPTS = 10

export const useConnectHardwareWallet = (onConnect: (hardwareWalletInfos: THardwareWalletInfo[]) => Promise<void>) => {
  const [status, setStatus] = useState<TStatus>('searching')
  const triesRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const tryConnect = async () => {
    try {
      const connectedHardwareWallet = await window.api.sendAsync('connectHardwareWallet')

      setStatus('connected')
      clearTimeout(timeoutRef.current)

      await UtilsHelper.sleep(2000)

      onConnect(connectedHardwareWallet)
    } catch {
      triesRef.current += 1

      if (triesRef.current > MAX_ATTEMPTS) {
        setStatus('not-connected')
        clearTimeout(timeoutRef.current)
      } else {
        timeoutRef.current = setTimeout(tryConnect, 2000)
      }
    }
  }

  const handleTryConnect = () => {
    triesRef.current = 0
    setStatus('searching')
    tryConnect()
  }

  useMountUnsafe(() => {
    handleTryConnect()

    return () => {
      clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return { status, handleTryConnect }
}

export const useHardwareWalletActions = () => {
  const { walletsRef } = useWalletsSelector()
  const { t: commonT } = useTranslation('common')
  const { createWallet, editAccount, importAccount, editWallet } = useBlockchainActions()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const createHardwareWallet = useCallback(
    async (infos: THardwareWalletInfo[]) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      const promises = infos.map(async info => {
        let existentWallet: IWalletState | undefined
        let wallet: IWalletState

        info.accounts.some(hardwareAccount => {
          existentWallet = walletsRef.current.find(wallet =>
            wallet.accounts.some(
              AccountHelper.predicate({ address: hardwareAccount.address, blockchain: info.blockchain })
            )
          )

          return !!existentWallet
        })

        if (!existentWallet) {
          wallet = createWallet({ name: commonT('wallet.ledgerName'), type: 'hardware' })
        } else {
          wallet = editWallet({
            wallet: existentWallet,
            data: {
              type: 'hardware',
            },
          })
        }

        wallet.accounts.map(account =>
          editAccount({
            account,
            data: {
              type: 'hardware',
            },
          })
        )

        const editedWallet = walletsRef.current.find(item => item.id === wallet.id)!

        const accountsPromises = info.accounts.map(async hardwareAccount => {
          const existentAccount = editedWallet.accounts.find(
            AccountHelper.predicate({ address: hardwareAccount.address, blockchain: info.blockchain })
          )

          if (existentAccount) {
            editAccount({
              account: existentAccount,
              data: {
                key: hardwareAccount.key,
              },
            })

            return existentAccount
          }

          return await importAccount({
            address: hardwareAccount.address,
            blockchain: info.blockchain,
            type: 'hardware',
            key: hardwareAccount.key,
            wallet: editedWallet,
            order: MnemonicHelper.extractIndexFromPath(hardwareAccount.bip44Path!),
          })
        })

        return await Promise.all(accountsPromises)
      })

      const allAccounts = await Promise.all(promises)
      return allAccounts.flat()
    },
    [commonT, createWallet, currentLoginSessionRef, editAccount, editWallet, walletsRef, importAccount]
  )

  const addNewHardwareAccount = useCallback(
    async (wallet: IWalletState, accountName?: string) => {
      try {
        if (!currentLoginSessionRef.current) {
          throw new Error('Login session not defined')
        }

        if (wallet.type !== 'hardware') {
          throw new Error('Wallet is not hardware')
        }

        const accountOrder = UtilsHelper.getNextNumberOrMissing(wallet.accounts.map(account => account.order))
        // When a wallet is hardware, all accounts are from the same blockchain
        const blockchain = wallet.accounts[0].blockchain

        const info = await window.api.sendAsync('addNewHardwareAccount', { index: accountOrder, blockchain })

        await importAccount({
          address: info.account.address,
          blockchain: info.blockchain,
          type: 'hardware',
          wallet,
          key: info.account.key,
          order: accountOrder,
          name: accountName ?? `Account ${accountOrder + 1}`,
        })
      } catch (error: any) {
        ToastHelper.error({ message: error.message })
      }
    },
    [currentLoginSessionRef, importAccount]
  )

  return {
    createHardwareWallet,
    addNewHardwareAccount,
  }
}
