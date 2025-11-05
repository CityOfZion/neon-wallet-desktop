import { useCallback, useEffect, useRef, useState } from 'react'

import { BSKeychainHelper, TBSAccount } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'

import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseHardwareWalletByUsbStatus } from '@shared/types/hooks'
import { TConnectHardwareWalletByUsbParams } from '@shared/types/ipc'
import { IAccountState, IWalletState } from '@shared/types/store'

import { useAccountMapSelector } from './useAccountSelector'
import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch } from './useRedux'
import { useLastIndexesByWallet } from './useUtilitySelector'

const CONNECT_MAX_ATTEMPTS = 10

export const useHardwareWalletByUsb = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useHardwareWalletByUsb' })
  const { lastIndexesByWalletRef } = useLastIndexesByWallet()

  const [status, setStatus] = useState<TUseHardwareWalletByUsbStatus>('searching')

  const abortControllerRef = useRef<AbortController>(null)

  const connect = async (params?: Omit<TConnectHardwareWalletByUsbParams, 'lastIndexesByWallet'>) => {
    abortControllerRef.current = new AbortController()

    setStatus('searching')

    await window.api.sendAsync('hardwareWallet:disconnect')

    // Prevent a UI freeze when connecting the hardware wallet
    await SharedUtilsHelper.sleep(1000)

    for (let index = 0; index < CONNECT_MAX_ATTEMPTS; index++) {
      if (index > 0) {
        await SharedUtilsHelper.sleep(2000)
      }

      if (abortControllerRef.current.signal.aborted) {
        break
      }

      try {
        const info = await window.api.sendAsync('hardwareWalletByUsb:connect', {
          lastIndexesByWallet: lastIndexesByWalletRef.current,
          ...params,
        })

        if (abortControllerRef.current.signal.aborted) {
          await window.api.sendAsync('hardwareWallet:disconnect')
          break
        }

        setStatus('connected')
        // Improve the UX
        await SharedUtilsHelper.sleep(1000)

        return info
      } catch {
        /* empty */
      }
    }

    setStatus('not-connected')
    throw new Error(t('errors.noDevice'))
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return { connect, status, setStatus }
}

export const useHardwareWalletActions = () => {
  const { t: commonT } = useTranslation('common')
  const { createWallet, editAccount, importAccount, editWallet } = useBlockchainActions()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const dispatch = useAppDispatch()
  const { accountsMapRef } = useAccountMapSelector()

  const createHardwareWallet = useCallback(
    async (accounts: TBSAccount<TBlockchainServiceKey>[]) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      const existentWalletsByBlockchain = new Map<TBlockchainServiceKey, IWalletState>()
      const groupedAccountInfosByBlockchain = new Map<
        TBlockchainServiceKey,
        {
          existentAccount?: IAccountState
          account: TBSAccount<TBlockchainServiceKey>
        }[]
      >()

      // Group accounts by blockchain and check if the wallet already exists
      accounts.forEach(account => {
        const existentAccount = accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(account))
        const existentWallet = existentAccount?.wallet

        const groupedInfo = groupedAccountInfosByBlockchain.get(account.blockchain) ?? []
        groupedInfo.push({ existentAccount, account })

        groupedAccountInfosByBlockchain.set(account.blockchain, groupedInfo)

        // If the wallet already exist, we reuse it
        if (existentWallet && !existentWalletsByBlockchain.has(account.blockchain)) {
          existentWalletsByBlockchain.set(account.blockchain, existentWallet)
        }
      })

      const newAccounts: IAccountState[] = []

      for (const [blockchain, accountInfos] of groupedAccountInfosByBlockchain.entries()) {
        const existentWallet = existentWalletsByBlockchain.get(blockchain)

        let wallet: IWalletState

        if (!existentWallet) {
          wallet = createWallet({
            name: commonT('wallet.ledgerName', { blockchain: commonT(`blockchain.${blockchain}`) }),
            type: 'hardware',
          })
        } else {
          wallet = editWallet({
            wallet: existentWallet,
            data: {
              name: commonT('wallet.ledgerName', { blockchain: commonT(`blockchain.${blockchain}`) }),
              type: 'hardware',
            },
          })
        }

        for (const info of accountInfos) {
          let account: IAccountState | undefined

          if (info.existentAccount) {
            account = editAccount({
              account: info.existentAccount,
              data: {
                key: info.account.key,
                type: 'hardware',
              },
            })
          } else {
            account = await importAccount({
              address: info.account.address,
              blockchain: info.account.blockchain,
              type: 'hardware',
              key: info.account.key,
              wallet,
              order: BSKeychainHelper.extractIndexFromPath(info.account.bip44Path!),
            })
          }

          newAccounts.push(account)
        }
      }

      return newAccounts
    },
    [currentLoginSessionRef, accountsMapRef, createWallet, commonT, editWallet, editAccount, importAccount]
  )

  const addNewHardwareAccount = useCallback(
    async (wallet: IWalletState, accountName?: string) => {
      if (!currentLoginSessionRef.current) {
        throw new Error('Login session not defined')
      }

      if (wallet.type !== 'hardware') {
        throw new Error('Wallet is not hardware')
      }
      // When a wallet is hardware, all accounts are from the same blockchain
      const blockchain = wallet.accounts[0].blockchain

      const accountOrder = AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)

      const serviceAccount = await window.api.sendAsync('hardwareWallet:addAccount', {
        index: accountOrder,
        blockchain,
      })

      await importAccount({
        ...serviceAccount,
        type: 'hardware',
        wallet,
        order: accountOrder,
        name: accountName || `Account ${accountOrder + 1}`,
      })

      const firstAccount = await window.api.sendAsync('hardwareWallet:getAccount', { index: 0, blockchain })
      dispatch(
        utilityReducerActions.saveLastIndexByWallet({
          firstAccountAddress: firstAccount.address,
          index: accountOrder,
          blockchain,
        })
      )

      return serviceAccount
    },
    [currentLoginSessionRef, dispatch, importAccount]
  )

  const isConnectedAndUnlockedHardwareWallet = useCallback(async (account: IAccountState) => {
    try {
      return await window.api.sendAsync('hardwareWallet:isConnectedAndUnlocked', { blockchain: account.blockchain })
    } catch (error) {
      console.error(error)
      return false
    }
  }, [])

  return {
    createHardwareWallet,
    addNewHardwareAccount,
    isConnectedAndUnlockedHardwareWallet,
  }
}
