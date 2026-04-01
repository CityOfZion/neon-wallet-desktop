import { useCallback, useEffect, useRef, useState } from 'react'

import { BSKeychainHelper, TBSAccount } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { AccountHelper } from '@renderer/helpers/AccountHelper'

import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { TUseHardwareWalletByUsbStatus } from '@shared/types/hooks'
import { TAccount, TWallet } from '@shared/types/store'

import { useEditAccount, useImportAccount } from './useAccountActions'
import { useAccountsWithWalletMapSelector } from './useAccountSelector'
import { useLoginSessionSelector } from './useAuthSelector'
import { useAppDispatch } from './useRedux'
import { useLastIndexesByWallet } from './useUtilitySelector'
import { useCreateWallet, useEditWallet } from './useWalletActions'

const CONNECT_MAX_ATTEMPTS = 10

export const useHardwareWalletByUsb = () => {
  const { t } = useTranslation('common')

  const { lastIndexesByWalletRef } = useLastIndexesByWallet()

  const [status, setStatus] = useState<TUseHardwareWalletByUsbStatus>('searching')

  const abortControllerRef = useRef<AbortController>(null)

  const connect = async () => {
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
        const info = await window.api.sendAsync('hardwareWallet:connectByUsb', {
          lastIndexesByWallet: lastIndexesByWalletRef.current,
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
    throw new AppError(t('hardwareWallet.errors.hardwareWalletNotFound'))
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return { connect, status, setStatus }
}

export const useCreateHardwareWallet = () => {
  const { t: tCommon } = useTranslation('common')
  const { editWallet } = useEditWallet()
  const { createWallet } = useCreateWallet()
  const { editAccount } = useEditAccount()
  const { importAccount } = useImportAccount()
  const { loginSessionRef } = useLoginSessionSelector()
  const { accountsWithWalletMapRef } = useAccountsWithWalletMapSelector()

  const createHardwareWallet = useCallback(
    async (accounts: TBSAccount<TBlockchainServiceKey>[]) => {
      if (!loginSessionRef.current) {
        throw new AppError(tCommon('errors.loginSessionIsNotDefined'))
      }

      const existentWalletsByBlockchain = new Map<TBlockchainServiceKey, TWallet>()
      const groupedAccountInfosByBlockchain = new Map<
        TBlockchainServiceKey,
        {
          existentAccount?: TAccount
          account: TBSAccount<TBlockchainServiceKey>
        }[]
      >()

      // Group accounts by blockchain and check if the wallet already exists
      accounts.forEach(account => {
        const existentAccount = accountsWithWalletMapRef.current.get(SharedAccountHelper.buildAccountKey(account))
        const existentWallet = existentAccount?.wallet

        const groupedInfo = groupedAccountInfosByBlockchain.get(account.blockchain) || []
        groupedInfo.push({ existentAccount, account })

        groupedAccountInfosByBlockchain.set(account.blockchain, groupedInfo)

        // If the wallet already exist, we reuse it
        if (existentWallet && !existentWalletsByBlockchain.has(account.blockchain)) {
          existentWalletsByBlockchain.set(account.blockchain, existentWallet)
        }
      })

      const newAccounts: TAccount[] = []

      for (const [blockchain, accountInfos] of groupedAccountInfosByBlockchain.entries()) {
        const existentWallet = existentWalletsByBlockchain.get(blockchain)

        let wallet: TWallet

        if (!existentWallet) {
          wallet = createWallet({
            name: tCommon('wallet.ledgerName', { blockchain: tCommon(`blockchain.${blockchain}`) }),
            type: 'hardware',
          })
        } else {
          wallet = editWallet({
            wallet: existentWallet,
            data: {
              name: tCommon('wallet.ledgerName', { blockchain: tCommon(`blockchain.${blockchain}`) }),
              type: 'hardware',
            },
          })
        }

        for (const info of accountInfos) {
          let account: TAccount | undefined

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
              order: BSKeychainHelper.extractIndexFromPath(info.account.bipPath!),
            })
          }

          newAccounts.push(account)
        }
      }

      return newAccounts
    },
    [loginSessionRef, accountsWithWalletMapRef, createWallet, tCommon, editWallet, editAccount, importAccount]
  )

  return { createHardwareWallet }
}

export const useAddAccountHardwareWallet = () => {
  const { importAccount } = useImportAccount()
  const { loginSessionRef } = useLoginSessionSelector()
  const dispatch = useAppDispatch()
  const { t: tCommon } = useTranslation('common')

  const addNewHardwareAccount = useCallback(
    async (wallet: TWallet, accountName?: string) => {
      if (!loginSessionRef.current) {
        throw new AppError(tCommon('errors.loginSessionIsNotDefined'))
      }

      if (wallet.type !== 'hardware') {
        throw new AppError(tCommon('hardwareWallet.errors.walletIsNotHardware'))
      }
      // When a wallet is hardware, all accounts are from the same blockchain
      const blockchain = wallet.accounts[0].blockchain

      const accountOrder = AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)

      const serviceAccount = await window.api.sendAsync('hardwareWallet:getAccount', {
        index: accountOrder,
        blockchain,
      })

      const account = await importAccount({
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

      return account
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loginSessionRef, dispatch, importAccount]
  )

  return { addNewHardwareAccount }
}
