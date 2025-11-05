import { useRef } from 'react'

import { hasNft } from '@cityofzion/blockchain-service'
import intersection from 'lodash/intersection'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useOwnAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useUnreadNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { useLazyBalance } from '@renderer/hooks/useBalances'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useMount } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useLazyVoteNeo3GetVoteDetailsByAddress } from '@renderer/hooks/useVoteNeo3'

import { FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN } from '@renderer/constants/fraudulent-tokens'
import { LOCAL_SKINS } from '@renderer/constants/skins'
import { bsAggregator } from '@renderer/libs/blockchain-service'
import { authReducerActions } from '@renderer/store/reducers/auth'
import { utilityReducerActions } from '@renderer/store/reducers/utility'
import * as Sentry from '@sentry/electron/renderer'
import type { TBalance } from '@shared/@types/query'
import type { IAccountState, TNotification } from '@shared/@types/store'

const useFraudulentTokensNotificationProcess = () => {
  const dispatch = useAppDispatch()

  const fraudulentNotificationsSetRef = useRef<Set<string>>(new Set())

  const generateNotificationKey = (blockchain: string, address: string, tokenHash: string) => {
    return `${blockchain}:${address}:${tokenHash}`
  }

  const processNotification = (notification: TNotification) => {
    try {
      const payload = notification.action?.payload
      if (payload?.to !== 'hide-fraudulent-token' || !payload.tokenHash) return

      const key = generateNotificationKey(payload.blockchain, payload.address, payload.tokenHash)

      fraudulentNotificationsSetRef.current.add(key)
    } catch (error) {
      console.error('Error on processNotification (useFraudulentTokensNotificationProcess):', error)
      Sentry.captureException(error)
    }
  }

  const process = (account: IAccountState, balance: TBalance | undefined) => {
    try {
      if (!balance) return

      const fraudulentHashes = FRAUDULENT_TOKEN_HASHES_BY_BLOCKCHAIN[account.blockchain]
      if (!fraudulentHashes) return

      const fraudulentTokensOwned = new Set(intersection([...fraudulentHashes], [...balance.tokensBalancesMap.keys()]))

      for (const fraudulentHash of fraudulentTokensOwned) {
        const tokenBalance = balance.tokensBalancesMap.get(fraudulentHash)!

        const notificationKey = generateNotificationKey(account.blockchain, account.address, tokenBalance.token.hash)

        if (fraudulentNotificationsSetRef.current.has(notificationKey)) continue

        const notificationPrefix = 'pages:private.accountTasksManagerSetup.useVotingNeo3NotificationProcess'

        dispatch(
          authReducerActions.saveNotification({
            title: `${notificationPrefix}.notificationTitle`,
            previewBody: `${notificationPrefix}.notificationDescription`,
            previewBodyValue: tokenBalance.token.name,
            titleValue: tokenBalance.token.name,
            priority: 'high',
            action: {
              type: 'navigate',
              payload: {
                to: 'hide-fraudulent-token',
                address: balance.address,
                blockchain: balance.blockchain,
                tokenHash: tokenBalance.token.hash,
              },
            },
            related: {
              address: balance.address,
              blockchain: balance.blockchain,
            },
          })
        )
      }
    } catch (error) {
      console.error('Error on process (useFraudulentTokensNotificationProcess):', error)
      Sentry.captureException(error)
    }
  }

  const finish = () => {
    fraudulentNotificationsSetRef.current.clear()
  }

  return { process, processNotification, finish }
}

const useVotingNeo3NotificationProcess = () => {
  const dispatch = useAppDispatch()
  const { getVoteDetails } = useLazyVoteNeo3GetVoteDetailsByAddress()

  const votingNotificationsSetRef = useRef<Set<string>>(new Set())

  const generateNotificationKey = (blockchain: string, address: string) => {
    return `${blockchain}:${address}`
  }

  const processNotification = (notification: TNotification) => {
    try {
      const payload = notification.action?.payload

      if (payload?.to !== 'vote-neo3' || payload.blockchain !== 'neo3' || !payload.address) return

      votingNotificationsSetRef.current.add(generateNotificationKey(payload.blockchain, payload.address))
    } catch (error) {
      console.error('Error on processNotification (useVotingNeo3NotificationProcess):', error)
      Sentry.captureException(error)
    }
  }

  const process = async (account: IAccountState) => {
    try {
      if (account.blockchain !== 'neo3') return

      const notificationKey = generateNotificationKey(account.blockchain, account.address)

      if (votingNotificationsSetRef.current.has(notificationKey)) return

      const voteDetails = await getVoteDetails(account.address)

      if (!voteDetails || voteDetails.candidatePubKey || voteDetails.neoBalance === 0) return

      const notificationPrefix = 'pages:private.accountTasksManagerSetup.useVotingNeo3NotificationProcess'

      dispatch(
        authReducerActions.saveNotification({
          title: `${notificationPrefix}.notificationTitle`,
          previewBody: `${notificationPrefix}.notificationDescription`,
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
    } catch (error) {
      console.error('Error on process (useVotingNeo3NotificationProcess):', error)
      Sentry.captureException(error)
    }
  }

  const finish = () => {
    votingNotificationsSetRef.current.clear()
  }

  return { process, processNotification, finish }
}

const useUnlockLocalSkinsProcess = () => {
  const dispatch = useAppDispatch()
  const { editAccount } = useBlockchainActions()

  const unlockLocalSkinsSetRef = useRef<Set<string>>(new Set())
  const accountWithLocalSkinsRef = useRef<IAccountState[]>([])

  const process = async (account: IAccountState) => {
    try {
      if (account.skin.type === 'local') {
        accountWithLocalSkinsRef.current.push(account)
      }

      if (unlockLocalSkinsSetRef.current.size === LOCAL_SKINS.size) return

      for (const [key, skin] of LOCAL_SKINS) {
        const service = bsAggregator.blockchainServicesByName[account.blockchain]
        if (unlockLocalSkinsSetRef.current.has(key) || account.blockchain !== skin.blockchain || !hasNft(service))
          continue

        const hasToken = await service.nftDataService.hasToken({
          address: account.address,
          collectionHash: skin.collectionHash,
        })

        if (!hasToken) continue

        unlockLocalSkinsSetRef.current.add(key)
      }
    } catch (error) {
      console.error('Error processing account in UnlockLocalSkinsProcess:', error)
      Sentry.captureException(error)
    }
  }

  const finish = async () => {
    try {
      dispatch(utilityReducerActions.setUnlockedSkinIds([...unlockLocalSkinsSetRef.current]))

      for (const account of accountWithLocalSkinsRef.current) {
        if (unlockLocalSkinsSetRef.current.has(account.skin.id)) continue
        editAccount({ account, data: { skin: UtilsHelper.generateColorSkin() } })
      }

      accountWithLocalSkinsRef.current = []
      unlockLocalSkinsSetRef.current.clear()
    } catch (error) {
      console.error('Error finishing UnlockLocalSkinsProcess:', error)
      Sentry.captureException(error)
    }
  }

  return { process, finish }
}

const AccountTasksManagerSetup = () => {
  const { ownAccounts } = useOwnAccountsSelector()
  const { unreadNotificationsRef } = useUnreadNotificationsSelector()

  const { getBalance } = useLazyBalance()

  const fraudulentTokenProcess = useFraudulentTokensNotificationProcess()
  const votingNeo3Process = useVotingNeo3NotificationProcess()
  const unlockLocalSkinsProcess = useUnlockLocalSkinsProcess()

  const accountsAlreadyProcessedRef = useRef<Set<string>>(new Set())

  useMount(() => {
    requestIdleCallback(
      async () => {
        for (const notification of unreadNotificationsRef.current) {
          fraudulentTokenProcess.processNotification(notification)
          votingNeo3Process.processNotification(notification)
        }

        for (const account of ownAccounts) {
          if (accountsAlreadyProcessedRef.current.has(account.id)) continue

          accountsAlreadyProcessedRef.current.add(account.id)

          const balance = await getBalance(account, { showType: 'active' })

          fraudulentTokenProcess.process(account, balance)
          await votingNeo3Process.process(account)
          await unlockLocalSkinsProcess.process(account)
        }

        fraudulentTokenProcess.finish()
        votingNeo3Process.finish()
        await unlockLocalSkinsProcess.finish()
      },
      { timeout: 15000 }
    )
  }, [ownAccounts.length])

  return null
}

export default AccountTasksManagerSetup
