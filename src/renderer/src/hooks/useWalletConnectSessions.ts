import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ReactQueryHelper } from '@renderer/helpers/ReactQueryHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import type { TUseWalletConnectSessionsResult } from '@shared/types/query'
import type { IAccountState } from '@shared/types/store'

const buildWalletConnectSessionsQueryKey = (accounts?: IAccountState[]) => {
  const key = ['wallet-connect', 'sessions']

  if (accounts) {
    const accountIds = accounts.map(account => account.id).sort()
    key.push(...accountIds)
  }

  return key
}

export const invalidateWalletConnectSessions = (accounts?: IAccountState[]) => {
  return ReactQueryHelper.client.invalidateQueries({
    queryKey: buildWalletConnectSessionsQueryKey(accounts),
  })
}

const fetchSessions = async (accounts: IAccountState[]): Promise<TUseWalletConnectSessionsResult[]> => {
  const sessions: TUseWalletConnectSessionsResult[] = []

  for (const session of Object.values(WalletKitHelper.kit.getActiveSessions())) {
    const details = WalletKitHelper.getSessionDetails({
      services: Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName),
      session,
    })

    const account = accounts.find(SharedAccountHelper.predicate(details))
    if (!account) continue

    sessions.push({ ...session, details, account })
  }

  return sessions
}

export const useWalletConnectSessions = (accounts: IAccountState[]) => {
  const query = useQuery({
    queryKey: buildWalletConnectSessionsQueryKey(accounts),
    queryFn: fetchSessions.bind(null, accounts),
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  useEffect(() => {
    const listener = () => {
      invalidateWalletConnectSessions()
    }

    WalletKitHelper.kit.on('session_delete', listener)

    return () => {
      WalletKitHelper.kit.off('session_delete', listener)
    }
  }, [])

  return query
}
