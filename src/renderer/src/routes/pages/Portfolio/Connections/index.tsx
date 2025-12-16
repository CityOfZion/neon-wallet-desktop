import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletConnectSessions } from '@renderer/hooks/useWalletConnectSessions'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import TbPlugX from '@renderer/assets/images/tb-plug-x.svg?react'

const PortfolioConnectionsPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioConnections' })

  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const sessionsQuery = useWalletConnectSessions(accounts)

  const sessions = sessionsQuery.data || []

  return (
    <Fragment>
      <div className="mb-3 flex justify-between text-sm">
        <p className="text-white">{t('title')}</p>

        <span className="text-gray-300">
          {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
        </span>
      </div>

      <Separator />

      <div className="mt-5 flex min-h-0 grow flex-col">
        <div
          className={StyleHelper.mergeStyles('flex flex-row justify-between', {
            'justify-end': sessions.length === 0,
          })}
        >
          {sessions.length > 0 && (
            <Button
              variant="text"
              label={t('disconnectAllButtonLabel')}
              leftIcon={<TbPlugX />}
              flat
              colorSchema="error"
              onClick={modalNavigateWrapper('dapp-disconnection', { state: { sessions } })}
            />
          )}

          <p className="text-lg text-gray-300">{t('totalConnections', { connections: sessions.length })}</p>
        </div>

        <ConnectionsTable withAddress sessions={sessions} tableHeaderClassName="bg-gray-800" className="mt-4" />
      </div>
    </Fragment>
  )
}

export default PortfolioConnectionsPage
