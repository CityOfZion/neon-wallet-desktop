import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { hasNft } from '@cityofzion/blockchain-service'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { LOCAL_SKINS } from '@renderer/constants/skins'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { IAccountState } from '@shared/@types/store'

import { useAccountsSelector } from './useAccountSelector'
import { useCurrentLoginSessionSelector } from './useAuthSelector'
import { useBlockchainActions } from './useBlockchainActions'
import { useLogin } from './useLogin'
import { useModalHistories, useModalNavigate } from './useModalRouter'
import { useMountUnsafe } from './useMount'
import { useAppDispatch } from './useRedux'
import { useSelectedNetworkByBlockchainSelector, useUnlockedSkinIdsSelector } from './useSettingsSelector'
import { useWalletsSelector } from './useWalletSelector'

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

    window.api.sendSync('restore')
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
  const { logout } = useLogin()
  const { t: commonT } = useTranslation('common')

  useMountUnsafe(() => {
    if (currentLoginSessionRef.current?.type === 'password') {
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
    }
  })

  useEffect(() => {
    const removeHardwareWalletDisconnectedListener = window.api.listen('hardwareWalletDisconnected', () => {
      logout()
    })

    return () => {
      removeHardwareWalletDisconnectedListener()
    }
  }, [logout])

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

const useUnlockedSkins = () => {
  const { unlockedSkinIdsRef } = useUnlockedSkinIdsSelector()
  const { accounts } = useAccountsSelector()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()
  const dispatch = useAppDispatch()

  const unlockSkins = useCallback(async () => {
    await Promise.allSettled(
      LOCAL_SKINS.map(async skin => {
        if (
          unlockedSkinIdsRef.current.includes(skin.id) ||
          !NetworkHelper.isMainnet(skin.blockchain, networkByBlockchainRef.current[skin.blockchain])
        )
          return

        await Promise.allSettled(
          accounts.map(async account => {
            if (account.type === 'watch') return

            const service = bsAggregator.blockchainServicesByName[account.blockchain]
            if (!hasNft(service)) return

            const hasToken = await service.nftDataService.hasToken({
              contractHash: skin.unlockedContractHash,
              address: account.address,
            })

            if (hasToken) {
              dispatch(settingsReducerActions.unlockSkin(skin.id))
            }
          })
        )
      })
    )
  }, [accounts, dispatch, networkByBlockchainRef, unlockedSkinIdsRef])

  useEffect(() => {
    unlockSkins()
  }, [unlockSkins])
}

export const useAfterLogin = () => {
  useRegisterWalletConnectListeners()
  useRegisterHardwareWalletListeners()
  useRegisterDeeplinkListeners()
  useUnlockedSkins()
}
