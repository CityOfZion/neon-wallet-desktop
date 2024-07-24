import { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { useAccountsSelector } from './useAccountSelector'
import { useAppDispatch, useAppSelector } from './useRedux'
import {
  useEncryptedPasswordSelector,
  useSelectedNetworkByBlockchainSelector,
  useSelectedNetworkProfileSelector,
} from './useSettingsSelector'

const useWalletConnectListeners = () => {
  const { accountsRef } = useAccountsSelector()
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()
  const { networkByBlockchainRef } = useSelectedNetworkByBlockchainSelector()

  useEffect(() => {
    const removeGetStoreFromWCListener = window.api.listen('getStoreFromWC', ({ args }) => {
      const info = WalletConnectHelper.getAccountInformationFromSession(args)
      const account = accountsRef.current.find(AccountHelper.predicate(info))

      window.api.sendSync('sendStoreFromWC', {
        account,
        encryptedPassword: encryptedPasswordRef.current,
        networkByBlockchain: networkByBlockchainRef.current,
      })
    })

    return () => {
      removeGetStoreFromWCListener()
    }
  }, [accountsRef, encryptedPasswordRef, networkByBlockchainRef])
}

const useRegisterLedgerListeners = () => {
  const { t } = useTranslation('hooks', { keyPrefix: 'useLedgerFlow' })
  const { t: commonT } = useTranslation('common')

  useEffect(() => {
    const removeLedgerConnectedListener = window.api.listen('ledgerConnected', ({ args }) => {
      ToastHelper.success({
        message: t('ledgerConnected', {
          address: StringHelper.truncateStringMiddle(args.address, 25),
          blockchain: commonT(`blockchain.${args.blockchain}`),
        }),
      })
    })

    const removeLedgerDisconnectedListener = window.api.listen('ledgerDisconnected', ({ args }) => {
      ToastHelper.error({
        message: t('ledgerDisconnected', {
          address: StringHelper.truncateStringMiddle(args.address, 25),
          blockchain: commonT(`blockchain.${args.blockchain}`),
        }),
      })
    })

    const removeGetLedgerSignatureStartListener = window.api.listen('getLedgerSignatureStart', () => {
      ToastHelper.loading({ message: commonT('ledger.requestingPermission'), id: 'ledger-request-permission' })
    })

    const removeGetLedgerSignatureEndListener = window.api.listen('getLedgerSignatureEnd', () => {
      ToastHelper.dismiss('ledger-request-permission')
    })

    window.api.sendSync('startLedger')

    return () => {
      removeLedgerConnectedListener()
      removeLedgerDisconnectedListener()
      removeGetLedgerSignatureStartListener()
      removeGetLedgerSignatureEndListener()
    }
  }, [t, commonT])
}

const useOverTheAirUpdate = () => {
  const { ref: hasOverTheAirUpdatesRef } = useAppSelector(state => state.settings.hasOverTheAirUpdates)
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const removeUpdateCompletedListener = window.api.listen('updateCompleted', () => {
      dispatch(settingsReducerActions.setHasOverTheAirUpdates(true))
      window.api.sendAsync('quitAndInstall')
    })

    window.api.sendAsync('checkForUpdates')

    return () => {
      removeUpdateCompletedListener()
    }
  }, [dispatch])

  useEffect(() => {
    if (hasOverTheAirUpdatesRef.current) {
      modalNavigate('auto-update-completed')
    }
  }, [hasOverTheAirUpdatesRef, modalNavigate])
}

const useDeeplinkListeners = () => {
  const { encryptedPasswordRef } = useEncryptedPasswordSelector()
  const { t } = useTranslation('hooks', { keyPrefix: 'DappConnection' })

  useEffect(() => {
    const handleDeeplink = async (uri?: string) => {
      if (!uri) return

      window.api.sendSync('restore')

      if (!encryptedPasswordRef.current)
        ToastHelper.info({
          message: t('pleaseLogin'),
        })
    }

    const removeListener = window.api.listen('deeplink', ({ args }) => handleDeeplink(args))
    window.api.sendAsync('getInitialDeepLinkUri').then(handleDeeplink)

    return () => {
      removeListener()
    }
  }, [encryptedPasswordRef, t])
}

const useNetworkChange = () => {
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  useLayoutEffect(() => {
    Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
      const network = networkByBlockchain[service.blockchainName]
      service.setNetwork(network)
    })
  }, [networkByBlockchain])
}

const useStoreStartup = () => {
  const { accountsRef } = useAccountsSelector()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(accountReducerActions.removeAllPendingTransactions())

    // Migrate backgroundColor to skin
    accountsRef.current.forEach(account => {
      const backgroundColor = (account as any).backgroundColor
      if (!backgroundColor) return

      dispatch(
        accountReducerActions.saveAccount({
          ...account,
          skin: { id: backgroundColor, type: 'color' },
          backgroundColor: undefined,
        } as any)
      )
    })

    Object.entries(selectedNetworkProfile.networkByBlockchain).forEach(([blockchain, network]) => {
      dispatch(settingsReducerActions.setSelectNetwork({ blockchain: blockchain as TBlockchainServiceKey, network }))
    })
  }, [dispatch, selectedNetworkProfile.networkByBlockchain, accountsRef])
}

export const useBeforeLogin = () => {
  useRegisterLedgerListeners()
  useOverTheAirUpdate()
  useNetworkChange()
  useStoreStartup()
  useDeeplinkListeners()
  useWalletConnectListeners()
}
