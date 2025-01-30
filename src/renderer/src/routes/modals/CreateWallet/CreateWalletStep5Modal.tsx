import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import NeonWalletIcon3D from '@renderer/assets/images/neon-wallet-icon-3d.svg?react'
import { Button } from '@renderer/components/Button'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  accounts: IAccountState
}

export const CreateWalletStep5Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step5' })
  const { accounts } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleNavigate = () => {
    modalNavigate(-5)
    navigate(`/app/wallets/${accounts[0].id}/overview`)
  }

  return (
    <CreateWalletModalLayout>
      <div className="flex flex-col items-center w-full h-full justify-between">
        <div className="flex flex-col w-full gap-2.5 px-28 items-center justify-center h-full">
          <NeonWalletIcon3D aria-hidden={true} />
          <div className="text-white text-lg text-center">{t('title')}</div>
          <div className="text-gray-100 text-xs text-center">{t('description')}</div>
        </div>

        <Button className="w-48 mb-5" type="submit" label={t('viewWalletButtonLabel')} flat onClick={handleNavigate} />
      </div>
    </CreateWalletModalLayout>
  )
}
