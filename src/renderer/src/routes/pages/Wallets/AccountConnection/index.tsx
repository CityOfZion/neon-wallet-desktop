import { useTranslation } from 'react-i18next'
import { TbPlugX, TbPlus } from 'react-icons/tb'
import { useOutletContext } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'
import { IAccountState } from '@shared/@types/store'

type TOutletContext = {
  account: IAccountState
}

export const AccountConnections = () => {
  const { sessions } = useWalletConnectWallet()
  const { modalNavigateWrapper } = useModalNavigate()

  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountConnections' })

  const { account } = useOutletContext<TOutletContext>()

  const filteredSessions = sessions.filter(session => {
    const { address, blockchain } = WalletConnectHelper.getAccountInformationFromSession(session)

    return AccountHelper.predicate(account)({ address, blockchain }) && account.type !== 'watch'
  })

  return (
    <AccountDetailsLayout
      actions={
        <div className="flex items-center gap-2">
          <span className="text-gray-300 mr-2">{t('totalConnections', { connections: filteredSessions.length })}</span>

          <Button
            variant="text"
            label={t('newConnection')}
            leftIcon={<TbPlus />}
            flat
            onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
          />

          <Button
            variant="text"
            label={t('disconnectAll')}
            leftIcon={<TbPlugX />}
            flat
            colorSchema="error"
            disabled={filteredSessions.length === 0}
            onClick={modalNavigateWrapper('dapp-disconnection', { state: { sessions: filteredSessions } })}
          />
        </div>
      }
      title={t('title')}
    >
      <ConnectionsTable
        hasAddress={false}
        sessions={filteredSessions}
        tableHeaderClassName="bg-gray-950"
        className="mt-5"
      />
    </AccountDetailsLayout>
  )
}
