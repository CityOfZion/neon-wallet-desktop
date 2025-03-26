import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainService, BSWithLedger } from '@cityofzion/blockchain-service'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { MnemonicHelper } from '@renderer/helpers/MnemonicHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { THardwareWalletInfo } from '@shared/@types/ipc'
import { IAccountState, IWalletState, TAccountType } from '@shared/@types/store'

import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useAppDispatch } from './useRedux'
import { useLastIndexesByWallet } from './useUtilitySelector'
import { useWalletsSelector } from './useWalletSelector'

type TStatus = 'searching' | 'connected' | 'not-connected'

const MAX_ATTEMPTS = 10

export type TConnectHardwareWalletResponse = {
  status: TStatus
  handleTryConnect: () => void
}

type TConnectHardwareWalletOptions = {
  onConnect(hardwareWalletInfos: THardwareWalletInfo[]): Promise<void>
  enabled?: boolean
  beforeConnectMs?: number
  beforeConnectValidation?(walletsInfo: THardwareWalletInfo[]): boolean
}

export const useConnectHardwareWallet = (options: TConnectHardwareWalletOptions): TConnectHardwareWalletResponse => {
  const { onConnect, enabled = true, beforeConnectMs = 2000, beforeConnectValidation } = options

  const [status, setStatus] = useState<TStatus>('searching')
  const triesRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isConnecting = useRef(enabled)
  const { lastIndexesByWalletRef } = useLastIndexesByWallet()
  const { walletsRef } = useWalletsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()

  const tryConnect = async () => {
    if (!isConnecting.current) return

    try {
      const connectedHardwareWallet = await window.api.sendAsync('connectHardwareWallet', {
        lastIndexesByWallet: lastIndexesByWalletRef.current,
      })

      if (!isConnecting.current) return

      if (currentLoginSessionRef.current) {
        const currentHardwareAccounts = walletsRef.current
          .filter(({ type }) => type === 'hardware')
          .flatMap(({ accounts }) => accounts)
          .filter(({ type }) => type === 'hardware')

        const [firstConnectedHardwareWallet] = connectedHardwareWallet

        if (
          firstConnectedHardwareWallet.accounts.every(({ address }) =>
            currentHardwareAccounts.some(
              AccountHelper.predicate({ address, blockchain: firstConnectedHardwareWallet.blockchain })
            )
          )
        )
          throw new Error('Accounts already connected')
      }

      if (beforeConnectValidation && !beforeConnectValidation(connectedHardwareWallet))
        throw new Error('There was an error on connection')

      setStatus('connected')
      clearTimeout(timeoutRef.current)

      await UtilsHelper.sleep(beforeConnectMs)

      onConnect(connectedHardwareWallet)
    } catch {
      if (!isConnecting.current) return

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
    isConnecting.current = true
    setStatus('searching')
    tryConnect()
  }

  useEffect(() => {
    isConnecting.current = enabled

    if (enabled) handleTryConnect()

    return () => {
      isConnecting.current = false
      clearTimeout(timeoutRef.current)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { status, handleTryConnect }
}

type TCreateHardwareWalletOptions = {
  accountsType?: TAccountType
}

export const useHardwareWalletActions = () => {
  const { walletsRef } = useWalletsSelector()
  const { t: commonT } = useTranslation('common')
  const { createWallet, editAccount, importAccount, editWallet } = useBlockchainActions()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const dispatch = useAppDispatch()

  const isConnectedAndUnlockedHardwareWallet = useCallback(
    async ({ order, encryptedKey, blockchain }: IAccountState) => {
      try {
        const service = bsAggregator.blockchainServicesByName[blockchain] as BlockchainService<TBlockchainServiceKey> &
          BSWithLedger<TBlockchainServiceKey>

        const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
          value: encryptedKey!,
          encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
        })

        const senderAccount = service.generateAccountFromPublicKey(key)

        senderAccount.isHardware = true
        senderAccount.bip44Path = AccountHelper.getBip44Path(service, order)

        return await window.api.sendAsync('isConnectedAndUnlockedHardwareWallet', { account: senderAccount, order })
      } catch (error) {
        console.error(error)

        return false
      }
    },
    [currentLoginSessionRef]
  )

  const createHardwareWallet = useCallback(
    async (infos: THardwareWalletInfo[], options: TCreateHardwareWalletOptions = {}) => {
      const { accountsType = 'hardware' } = options

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
          wallet = createWallet({
            name: commonT('wallet.ledgerName', { blockchain: commonT(`blockchain.${info.blockchain}`) }),
            type: 'hardware',
          })
        } else {
          wallet = editWallet({
            wallet: existentWallet,
            data: {
              name: commonT('wallet.ledgerName', { blockchain: commonT(`blockchain.${info.blockchain}`) }),
              type: 'hardware',
            },
          })
        }

        wallet.accounts.map(account =>
          editAccount({
            account,
            data: {
              type: accountsType,
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
            type: accountsType,
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
        // When a wallet is hardware, all accounts are from the same blockchain
        const blockchain = wallet.accounts[0].blockchain

        const accountOrder = AccountHelper.getNextOrderOrMissing(wallet.accounts, blockchain)

        const account = await window.api.sendAsync('addNewHardwareAccount', { index: accountOrder, blockchain })

        await importAccount({
          address: account.address,
          blockchain: account.blockchain,
          type: 'hardware',
          wallet,
          key: account.key,
          order: accountOrder,
          name: accountName ?? `Account ${accountOrder + 1}`,
        })

        const firstAccount = await window.api.sendAsync('getHardwareAccount', { index: 0, blockchain })
        dispatch(
          utilityReducerActions.saveLastIndexByWallet({
            firstAccountAddress: firstAccount.address,
            index: accountOrder,
            blockchain,
          })
        )
      } catch (error: any) {
        ToastHelper.error({ message: error.message })
      }
    },
    [currentLoginSessionRef, dispatch, importAccount]
  )

  return {
    createHardwareWallet,
    addNewHardwareAccount,
    isConnectedAndUnlockedHardwareWallet,
  }
}
