import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletConnectSessions } from '@renderer/hooks/useWalletConnectSessions'

import TbPlugX from '@renderer/assets/images/tb-plug-x.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { TAccount } from '@shared/types/store'

import { AccountDetailsLayout } from '../AccountDetailsLayout'

type TOutletContext = {
  account: TAccount
}

const AccountConnections = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountConnections' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { account } = useOutletContext<TOutletContext>()
  const sessionsQuery = useWalletConnectSessions([account])

  const sessions = sessionsQuery.data || []

  return (
    <AccountDetailsLayout
      actions={
        <div className="flex items-center gap-2">
          <span className="mr-2 text-gray-300">{t('totalConnections', { connections: sessions.length })}</span>

          <Button
            variant="text"
            label={t('newConnection')}
            leftIcon={<TbPlus aria-hidden />}
            flat
            onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
          />

          <Button
            variant="text"
            label={t('disconnectAll')}
            leftIcon={<TbPlugX aria-hidden />}
            flat
            colorSchema="error"
            disabled={sessions.length === 0}
            onClick={modalNavigateWrapper('dapp-disconnection', { state: { sessions } })}
          />
        </div>
      }
      heading={t('title')}
    >
      <ConnectionsTable sessions={sessions} tableHeaderClassName="bg-gray-950" className="mt-5" />
    </AccountDetailsLayout>
  )
}

export default AccountConnections
