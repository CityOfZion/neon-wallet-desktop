import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPlugX } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'
import { Separator } from '@renderer/components/Separator'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

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

        return accounts.some(account => account.type !== 'watch' && AccountHelper.predicate(info)(account))
      }),
    [sessions, accounts]
  )

  return (
    <div
      className={StyleHelper.mergeStyles('w-full flex flex-col py-3 flex-grow min-h-0 px-4 min-w-0', {
        'bg-gray-800 rounded shadow-lg': !address,
      })}
    >
      <div className="flex justify-between text-sm mb-3">
        <p className="text-white">{t('title')}</p>

        <span className="text-gray-300">
          {t('walletsAndAccounts', { wallets: wallets.length, accounts: accounts.length })}
        </span>
      </div>

      <Separator />

      <div className="mt-7 flex-grow flex flex-col min-h-0">
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
              onClick={modalNavigateWrapper('dapp-disconnection', { state: { filteredSessions } })}
            />
          )}

          <p className="text-gray-300 text-lg">{t('totalConnections', { connections: filteredSessions.length })}</p>
        </div>

        <ConnectionsTable
          hasAddress={true}
          sessions={filteredSessions}
          tableHeaderClassName="bg-gray-800"
          className="mt-4"
        />
      </div>
    </div>
  )
}
