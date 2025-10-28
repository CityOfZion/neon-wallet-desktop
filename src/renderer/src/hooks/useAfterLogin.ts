import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { hasNft } from '@cityofzion/blockchain-service'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN } from '@renderer/constants/fraudulent-tokens'
import { LOCAL_SKINS } from '@renderer/constants/skins'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { IAccountState, TNotificationNavigateActionHideFraudulentTokenPayload } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { useAccountsSelector, useOwnAccountsSelector } from './useAccountSelector'
import { useCurrentLoginSessionSelector, useUnreadNotificationsSelector } from './useAuthSelector'
import { useBalances } from './useBalances'
import { useBlockchainActions } from './useBlockchainActions'
import { useModalHistories, useModalNavigate } from './useModalRouter'
import { useMount, useMountUnsafe } from './useMount'
import { useAppDispatch } from './useRedux'
import { useSelectedNetworkByBlockchainSelector } from './useSettingsSelector'
import { useUnlockedSkinIdsSelector } from './useUtilitySelector'
import { useVoteNeo3GetVoteDetailsByAddresses } from './useVoteNeo3'
import { useWalletsSelector } from './useWalletSelector'

const useRegisterWalletConnectListeners = () => {
  const { sessions, requests } = useWalletConnectWallet()
  const { modalNavigate } = useModalNavigate()
  const { historiesRef } = useModalHistories()
  const { accountsRef } = useAccountsSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()

  const watchRequests = useCallback(async () => {
    await SharedUtilsHelper.sleep(1500)

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
      const account = accountsRef.current.find(SharedAccountHelper.predicate(info))

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
    const removeOnDisconnectListener = window.api.listen(
      'hardwareWallet:onDisconnect',
      transformHardwareAccountsToWatch
    )

    return () => {
      removeOnDisconnectListener()
    }
  }, [currentLoginSessionRef, transformHardwareAccountsToWatch])

  useEffect(() => {
    const removeOnSignatureStartListener = window.api.listen('hardwareWallet:onSignatureStart', () => {
      ToastHelper.loading({ message: commonT('ledger.requestingPermission'), id: 'hardware-wallet-request-permission' })
    })

    const removeOnSignatureEndListener = window.api.listen('hardwareWallet:onSignatureEnd', () => {
      ToastHelper.dismiss('hardware-wallet-request-permission')
    })

    return () => {
      removeOnSignatureStartListener()
      removeOnSignatureEndListener()
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

      const [_prefix, path] = uri.split('://')

      if (path.startsWith('migration')) {
        navigate('/app/settings/security/migrate-accounts')
        modalNavigate('migrate-accounts-step-2')
        return
      }

      if (path.startsWith('import?mnemonic') || path.startsWith('import/?mnemonic')) {
        let [, mnemonic] = path.split('=')
        mnemonic = atob(mnemonic)
        modalNavigate('import', { state: { text: mnemonic } })
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
              collectionHash: skin.collectionHash,
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

const useFraudulentTokensNotification = () => {
  const { accounts } = useAccountsSelector()
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()
  const dispatch = useAppDispatch()

  const hasAlreadyNotifiedRef = useRef(false)

  const balancesQuery = useBalances(accounts, {
    showType: 'active',
    queryOptions: { gcTime: Infinity, staleTime: Infinity },
  })

  useMount(
    () => {
      if (balancesQuery.isLoading || hasAlreadyNotifiedRef.current) return

      hasAlreadyNotifiedRef.current = true

      balancesQuery.data.forEach(balance => {
        const blockchain = balance.blockchain
        const service = bsAggregator.blockchainServicesByName[blockchain]

        const fraudulentTokenBalances = balance.tokensBalances.filter(
          tokenBalance =>
            !!FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN[blockchain]?.has(
              service.tokenService.normalizeHash(tokenBalance.token.hash)
            )
        )

        if (fraudulentTokenBalances.length === 0) return

        const tokens = fraudulentTokenBalances.map(({ token }) => token)

        tokens.forEach(token => {
          const tokenName = token.name
          const unreadNotification = unreadNotificationsRef.current.find(
            ({ titleValue, previewBodyValue, action }) =>
              !!action &&
              action.type === 'navigate' &&
              action.payload.to === 'hide-fraudulent-token' &&
              titleValue === tokenName &&
              previewBodyValue === tokenName &&
              SharedAccountHelper.predicate(balance)({
                address: action.payload.address,
                blockchain: action.payload.blockchain,
              })
          )

          const payload = unreadNotification?.action?.payload as TNotificationNavigateActionHideFraudulentTokenPayload
          const tokenHash = payload?.tokenHash

          if (tokenHash) return

          dispatch(
            authReducerActions.saveNotification({
              ...unreadNotification,
              title: 'hooks:useFraudulentTokensNotification.notificationTitle',
              titleValue: tokenName,
              previewBody: 'hooks:useFraudulentTokensNotification.notificationDescription',
              previewBodyValue: tokenName,
              priority: 'high',
              action: {
                type: 'navigate',
                payload: {
                  to: 'hide-fraudulent-token',
                  address: balance.address,
                  blockchain: balance.blockchain,
                  tokenHash: token.hash,
                },
              },
              related: {
                address: balance.address,
                blockchain: balance.blockchain,
              },
            })
          )
        })
      })
    },
    [balancesQuery.data, balancesQuery.isLoading, dispatch, unreadNotificationsRef],
    2000
  )
}

const useVotingNeo3Notification = () => {
  const { ownAccounts } = useOwnAccountsSelector()
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('hooks', { keyPrefix: 'useVotingNeo3Notification' })

  const voteNeo3Accounts = useMemo(() => ownAccounts.filter(account => account.blockchain === 'neo3'), [ownAccounts])

  const voteDetailsQuery = useVoteNeo3GetVoteDetailsByAddresses(voteNeo3Accounts)

  const alreadyNotifiedRef = useRef(false)

  useEffect(() => {
    if (voteDetailsQuery.isLoading || alreadyNotifiedRef.current) return

    alreadyNotifiedRef.current = true

    voteDetailsQuery.data.forEach(voteDetails => {
      if (voteDetails.candidatePubKey || voteDetails.neoBalance <= 0) return

      const hasUnreadNotification = unreadNotificationsRef.current.some(
        notification =>
          notification.action?.type === 'navigate' &&
          notification.action.payload.to === 'vote-neo3' &&
          notification.action.payload?.blockchain === 'neo3' &&
          notification.action.payload?.address === voteDetails.address
      )
      if (hasUnreadNotification) return

      dispatch(
        authReducerActions.saveNotification({
          title: 'hooks:useVotingNeo3Notification.notificationTitle',
          previewBody: 'hooks:useVotingNeo3Notification.notificationDescription',
          action: {
            type: 'navigate',
            payload: {
              to: 'vote-neo3',
              address: voteDetails.address,
              blockchain: 'neo3',
            },
          },
          related: {
            blockchain: 'neo3',
            address: voteDetails.address,
          },
        })
      )
    })
  }, [dispatch, t, unreadNotificationsRef, voteDetailsQuery.data, voteDetailsQuery.isLoading])
}

const useBackupReminderNotification = () => {
  const dispatch = useAppDispatch()
  const { walletsRef } = useWalletsSelector()
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()

  useMountUnsafe(() => {
    const hasWalletsWithoutBackup = walletsRef.current.some(wallet => wallet.backupStatus !== 'successful')

    if (!hasWalletsWithoutBackup) return

    const hasUnreadNotification = !!unreadNotificationsRef.current.find(
      ({ action }) => !!action && action.type === 'navigate' && action.payload.to === 'backup-wallet'
    )

    if (hasUnreadNotification) return

    setTimeout(() => {
      dispatch(
        authReducerActions.saveNotification({
          title: 'hooks:useBackupReminderNotification.notificationTitle',
          previewBody: 'hooks:useBackupReminderNotification.notificationDescription',
          priority: 'high',
          action: {
            type: 'navigate',
            payload: { to: 'backup-wallet' },
          },
        })
      )
    }, 4000)
  }, 0)
}

const useRegisterHotKeys = () => {
  const { modalNavigate } = useModalNavigate()
  const { historiesRef } = useModalHistories()

  const handleSearch = () => {
    const [lastHistory] = historiesRef.current.slice(-1)

    if (lastHistory?.route.name === 'search') {
      modalNavigate(-1)

      return
    }

    if (lastHistory) return

    modalNavigate('search')
  }

  useHotkeys('ctrl+f', handleSearch, { enableOnFormTags: true })
}

export const useAfterLogin = () => {
  useFraudulentTokensNotification()
  useRegisterWalletConnectListeners()
  useRegisterHardwareWalletListeners()
  useRegisterDeeplinkListeners()
  useUnlockSkins()
  useRegisterHotKeys()
  useVotingNeo3Notification()
  useBackupReminderNotification()
}
