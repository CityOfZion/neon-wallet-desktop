import { useTranslation } from 'react-i18next'
import { TbDeviceUsb, TbX } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as NeonWalletFullImage } from '@renderer/assets/images/neon-wallet-full.svg'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { AlertSuccessBanner } from '@renderer/components/AlertSuccessBanner'
import { Button } from '@renderer/components/Button'
import { SearchingLoader } from '@renderer/components/SearchingLoader'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useConnectHardwareWallet } from '@renderer/hooks/useConnectHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

export const ConnectHardwareWalletModal = () => {
  const { t: commonT } = useTranslation('common')
  const { t } = useTranslation('modals', { keyPrefix: 'connectHardwareWallet' })
  const { accountsRef } = useAccountsSelector()
  const { createWallet, importAccount, editAccount } = useBlockchainActions()
  const navigate = useNavigate()
  const { modalErase } = useModalNavigate()

  const { status, handleTryConnect } = useConnectHardwareWallet(async info => {
    let account = accountsRef.current.find(AccountHelper.predicate(info))

    if (!account) {
      const wallet = createWallet({ name: commonT('wallet.ledgerName'), type: 'hardware' })

      account = importAccount({
        wallet,
        address: info.address,
        blockchain: info.blockchain,
        type: 'hardware',
        key: info.publicKey,
      })
    } else {
      editAccount({
        account,
        data: {
          type: 'hardware',
          key: info.publicKey,
        },
      })
    }

    navigate(`/app/wallets/${account.id}/overview`)
    modalErase('center')
  })

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <NeonWalletFullImage />

        <p className="text-white text-2xl text-center mt-12">{t('title')}</p>

        <p className="text-gray-100 text-sm mt-6">{t('description')}</p>
      </div>

      {status === 'searching' && <SearchingLoader label={t('searchingLabel')} />}

      {status === 'not-connected' && (
        <AlertErrorBanner className="gap-2.5 text-sm py-5s" message={t('notConnectedMessage')} icon={<TbX />} />
      )}

      {status === 'connected' && (
        <AlertSuccessBanner
          className="gap-2.5 text-sm py-5"
          message={t('connectedMessage')}
          icon={<TbDeviceUsb className="rotate-45" />}
        />
      )}

      <Button
        label={t('searchAgainButtonLabel')}
        className="w-64"
        disabled={status !== 'not-connected'}
        onClick={handleTryConnect}
      />
    </CenterModalLayout>
  )
}
