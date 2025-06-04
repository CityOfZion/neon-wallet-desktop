import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPlugX } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

export const PortfolioConnectionsPage = () => {
  const { sessions } = useWalletConnectWallet()
  const { modalNavigateWrapper } = useModalNavigate()
  const { accounts } = useAccountsSelector()
  const { wallets } = useWalletsSelector()
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio.portfolioConnections' })
  const { address } = useParams()

  const filteredSessions = useMemo(
    () =>
      sessions.filter(session => {
        const info = WalletConnectHelper.getAccountInformationFromSession(session)

        return accounts.some(account => account.type !== 'watch' && SharedAccountHelper.predicate(info)(account))
      }),
    [sessions, accounts]
  )

  return (
    <div
      className={StyleHelper.mergeStyles('flex min-h-0 w-full min-w-0 flex-grow flex-col px-4 py-3', {
        'rounded bg-gray-800 shadow-lg': !address,
      })}
    >
      <div className="mb-3 flex justify-between text-sm">
        <p className="text-white">{t('title')}</p>

        <span className="text-gray-300">
          {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
        </span>
      </div>

      <Separator />

      <div className="mt-5 flex min-h-0 flex-grow flex-col">
        <div
          className={StyleHelper.mergeStyles('flex flex-row justify-between', {
            'justify-end': filteredSessions.length === 0,
          })}
        >
          {filteredSessions.length > 0 && (
            <Button
              variant="text"
              label={t('disconnectAllButtonLabel')}
              leftIcon={<TbPlugX />}
              flat
              colorSchema="error"
              onClick={modalNavigateWrapper('dapp-disconnection', { state: { sessions: filteredSessions } })}
            />
          )}

          <p className="text-lg text-gray-300">{t('totalConnections', { connections: filteredSessions.length })}</p>
        </div>

        <ConnectionsTable
          withAddress={true}
          sessions={filteredSessions}
          tableHeaderClassName="bg-gray-800"
          className="mt-4"
        />
      </div>
    </div>
  )
}
