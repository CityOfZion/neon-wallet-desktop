import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'

import NeonWalletIcon3D from '@renderer/assets/images/neon-wallet-icon-3d.svg?react'

import type { TModalState } from '@shared/types/modal'

const CreateWalletStep5Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step5' })
  const { accounts } = useModalState<TModalState<'create-wallet-step-5'>>()
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()

  const handleNavigate = () => {
    modalErase()
    navigate(`/wallets/${accounts[0].id}/overview`)
  }

  return (
    <CreateWalletModalLayout>
      <div className="flex h-full w-full flex-col items-center justify-between">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 px-28">
          <NeonWalletIcon3D aria-hidden />
          <div className="text-center text-lg text-white">{t('title')}</div>
          <div className="text-center text-xs text-gray-100">{t('description')}</div>
        </div>

        <Button className="mb-5 w-48" type="submit" label={t('viewWalletButtonLabel')} flat onClick={handleNavigate} />
      </div>
    </CreateWalletModalLayout>
  )
}

export default CreateWalletStep5Modal
