import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { hasNft } from '@cityofzion/blockchain-service'
import { BSNeoLegacy } from '@cityofzion/bs-neo-legacy'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { LOCAL_SKINS } from '@renderer/constants/skins'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

import { useAccountsSelector, useOwnAccountsSelector } from './useAccountSelector'
import { useCurrentLoginSessionSelector, useUnreadNotificationsSelector } from './useAuthSelector'
import { useBalances } from './useBalances'
import { useBlockchainActions } from './useBlockchainActions'
import { useModalHistories, useModalNavigate } from './useModalRouter'
import { useMountUnsafe } from './useMount'
import { createAppSelector, useAppDispatch, useAppSelector } from './useRedux'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useUnlockedSkinIdsSelector } from './useUtilitySelector'
import { useWalletsSelector } from './useWalletSelector'

const selectMigrationNeo3Accounts = createAppSelector(
  [state => state.auth.data.applicationDataByLoginType, state => state.auth.inMemoryData.currentLoginSession],
  (applicationDataByLoginType, currentLoginSession) => {
    const accounts: IAccountState[] = []

    applicationDataByLoginType[currentLoginSession?.type ?? 'password'].wallets.forEach(wallet =>
      wallet.accounts.forEach(account => {
        if (account.blockchain !== 'neoLegacy') return

        const isWatchHardwareAccount = account.type === 'watch' && wallet.type === 'hardware'
        if (!isWatchHardwareAccount && account.type === 'watch') return

        accounts.push(account)
      })
    )

    return accounts
  }
)

const useRegisterWalletConnectListeners = () => {
  const { sessions, requests } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { historiesRef } = useModalHistories()
  const { accountsRef } = useAccountsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()

  const watchRequests = useCallback(async () => {
    await UtilsHelper.sleep(1500)

    const currentHistory = historiesRef.current.slice(-1)[0]
    if (currentHistory && currentHistory.route.name === 'dapp-permission') {
      if (!requests.some(request => request.id === currentHistory.state?.request?.id)) {
        modalNavigate(-1)
      }

      return
    }

    if (requests.length <= 0) return
    const request = requests[0]

    const session = sessions.find(session => session.topic === request.topic)
    if (!session) return

    modalNavigate('dapp-permission', { state: { session, request } })
  }, [requests, sessions, modalNavigate, historiesRef])

  useEffect(() => {
    watchRequests()
  }, [watchRequests])

  useEffect(() => {
    const removeGetStoreFromWCListener = window.api.listen('getStoreFromWC', ({ args }) => {
      const info = WalletConnectHelper.getAccountInformationFromSession(args)
      const account = accountsRef.current.find(AccountHelper.predicate(info))

      window.api.sendSync('sendStoreFromWC', {
        account,
        encryptedPassword: currentLoginSessionRef.current?.encryptedPassword,
        networkByBlockchain: networkByBlockchainRef.current,
      })
    })

    return () => {
      removeGetStoreFromWCListener()
    }
  }, [accountsRef, currentLoginSessionRef, networkByBlockchainRef])
}

const useRegisterHardwareWalletListeners = () => {
  const { walletsRef } = useWalletsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { editAccount } = useBlockchainActions()
  const { t: commonT } = useTranslation('common')

  const transformHardwareAccountsToWatch = useCallback(() => {
    walletsRef.current
      .filter(wallet => wallet.type === 'hardware')
      .forEach(wallet => {
        wallet.accounts.forEach(account => {
          editAccount({
            account,
            data: {
              type: 'watch',
            },
          })
        })
      })
  }, [editAccount, walletsRef])

  useMountUnsafe(() => {
    if (currentLoginSessionRef.current?.type === 'password') {
      transformHardwareAccountsToWatch()
    }
  })

  useEffect(() => {
    const removeHardwareWalletDisconnectedListener = window.api.listen(
      'hardwareWalletDisconnected',
      transformHardwareAccountsToWatch
    )

    return () => {
      removeHardwareWalletDisconnectedListener()
    }
  }, [currentLoginSessionRef, transformHardwareAccountsToWatch])

  useEffect(() => {
    const removeGetHardwareWalletSignatureStartListener = window.api.listen('getHardwareWalletSignatureStart', () => {
      ToastHelper.loading({ message: commonT('ledger.requestingPermission'), id: 'hardware-wallet-request-permission' })
    })

    const removeGetHardwareWalletSignatureEndListener = window.api.listen('getHardwareWalletSignatureEnd', () => {
      ToastHelper.dismiss('hardware-wallet-request-permission')
    })

    return () => {
      removeGetHardwareWalletSignatureStartListener()
      removeGetHardwareWalletSignatureEndListener()
    }
  }, [commonT])
}

const useRegisterDeeplinkListeners = () => {
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const { t: commonWc } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      // Remove trailing slash
      uri = uri.endsWith('/') ? uri.slice(0, -1) : uri

      window.api.sendAsync('resetInitialDeeplink')

      if (uri === 'neon3://migration') {
        navigate('/app/settings/security/migrate-accounts')
        modalNavigate('migrate-accounts-step-2')
        return
      }

      const realWCUri = uri.split('uri=').pop()
      if (realWCUri) {
        let wcUri: string | undefined

        const decodedUri = decodeURIComponent(realWCUri)
        if (WalletConnectHelper.isValidURI(decodedUri)) {
          wcUri = decodedUri
        } else {
          const decodedBase64Uri = atob(decodedUri)
          if (WalletConnectHelper.isValidURI(decodedBase64Uri)) {
            wcUri = decodedBase64Uri
          }
        }

        if (wcUri) {
          modalNavigate('select-account', {
            state: {
              onSelectAccount: (account: IAccountState) => {
                modalNavigate('dapp-connection', { state: { account: account, uri: wcUri } })
              },
              title: commonWc('selectAccountModal.title'),
              buttonLabel: commonWc('selectAccountModal.selectSourceAccount'),
            },
          })
        }
      }
    }

    window.api.sendAsync('getInitialDeepLinkUri').then(handleDeeplink)

    const removeDeeplinkListener = window.api.listen('deeplink', ({ args }) => {
      handleDeeplink(args)
    })

    return () => {
      removeDeeplinkListener()
    }
  }, [commonWc, modalNavigate, navigate])
}

const useUnlockSkins = () => {
  const dispatch = useAppDispatch()
  const { unlockedSkinIds } = useUnlockedSkinIdsSelector()
  const { ownAccounts } = useOwnAccountsSelector()

  const unlockSkins = async () => {
    const skinIds = new Set<string>([])

    await Promise.allSettled(
      LOCAL_SKINS.map(async skin => {
        for (const account of ownAccounts) {
          try {
            const service = bsAggregator.blockchainServicesByName[account.blockchain]

            if (account.blockchain !== skin.blockchain || !hasNft(service)) continue

            const hasToken = await service.nftDataService.hasToken({
              address: account.address,
              contractHash: skin.unlockedContractHash,
            })

            if (!hasToken) continue

            skinIds.add(skin.id)

            break
          } catch {
            /* empty */
          }
        }
      })
    )

    const invalidSkinIds = unlockedSkinIds.filter(skinId => !skinIds.has(skinId))

    dispatch(utilityReducerActions.setUnlockedSkinIds([...skinIds]))
    dispatch(authReducerActions.removeAccountSkins(invalidSkinIds))
  }

  useEffect(() => {
    unlockSkins()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

const useMigrationNeo3Notification = () => {
  const { value: migrationNeo3Accounts } = useAppSelector(selectMigrationNeo3Accounts)
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useMigrationNeo3Notification' })

  const alreadyNotifiedRef = useRef(false)

  const balanceQuery = useBalances(migrationNeo3Accounts, {
    queryOptions: { gcTime: Infinity, staleTime: Infinity },
  })

  useEffect(() => {
    if (balanceQuery.isLoading || alreadyNotifiedRef.current) return

    alreadyNotifiedRef.current = true

    const neoLegacyService = bsAggregator.blockchainServicesByName.neoLegacy as BSNeoLegacy<TBlockchainServiceKey>
    balanceQuery.data.forEach(balance => {
      const neoLegacyMigrationAmounts = neoLegacyService.calculateNeoLegacyMigrationAmounts(balance.tokensBalances)
      if (!neoLegacyMigrationAmounts.hasEnoughGasBalance && !neoLegacyMigrationAmounts.hasEnoughNeoBalance) return

      const hasUnreadNotification = unreadNotificationsRef.current.some(
        notification =>
          notification.action?.type === 'navigate' &&
          notification.action.payload.to === 'migration-neo3' &&
          notification.action.payload?.blockchain === balance.blockchain &&
          notification.action.payload?.address === balance.address
      )
      if (hasUnreadNotification) return

      dispatch(
        authReducerActions.saveNotification({
          title: t('notificationTitle'),
          previewBody: t('notificationDescription'),
          action: {
            type: 'navigate',
            payload: {
              to: 'migration-neo3',
              address: balance.address,
              blockchain: balance.blockchain,
            },
          },
          related: {
            blockchain: balance.blockchain,
            address: balance.address,
          },
        })
      )
    })
  }, [balanceQuery.data, balanceQuery.isLoading, dispatch, t, unreadNotificationsRef])
}

export const useAfterLogin = () => {
  useMigrationNeo3Notification()
  useRegisterWalletConnectListeners()
  useRegisterHardwareWalletListeners()
  useRegisterDeeplinkListeners()
  useUnlockSkins()
}
