import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import { useWalletConnectWallet } from '@cityofzion/wallet-connect-sdk-wallet-react'
import TbPlugX from '@renderer/assets/images/tb-plug-x.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'
import { Button } from '@renderer/components/Button'
import { ConnectionsTable } from '@renderer/components/ConnectionsTable'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'
import { IAccountState } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

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

    return SharedAccountHelper.predicate(account)({ address, blockchain }) && account.type !== 'watch'
  })

  return (
    <AccountDetailsLayout
      actions={
        <div className="flex items-center gap-2">
          <span className="mr-2 text-gray-300">{t('totalConnections', { connections: filteredSessions.length })}</span>

          <Button
            variant="text"
            label={t('newConnection')}
            leftIcon={<TbPlus aria-hidden={true} />}
            flat
            onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
          />

          <Button
            variant="text"
            label={t('disconnectAll')}
            leftIcon={<TbPlugX aria-hidden={true} />}
            flat
            colorSchema="error"
            disabled={filteredSessions.length === 0}
            onClick={modalNavigateWrapper('dapp-disconnection', { state: { sessions: filteredSessions } })}
          />
        </div>
      }
      heading={t('title')}
    >
      <ConnectionsTable sessions={filteredSessions} tableHeaderClassName="bg-gray-950" className="mt-5" />
    </AccountDetailsLayout>
  )
}
