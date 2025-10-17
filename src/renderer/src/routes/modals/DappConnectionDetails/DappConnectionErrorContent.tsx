import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdArrowBack from '@renderer/assets/images/md-arrow-back.svg?react'

export const DappConnectionErrorContent = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnectionDetails.errorModal' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="mt-2.5 flex w-full grow flex-col items-center justify-between">
      <div className="flex flex-col items-center gap-y-2.5">
        <p className="text-lg text-gray-100">{t('subtitle2')}</p>
        <p className="text-sm text-gray-300">{t('subtitle3')}</p>
      </div>

      <Button
        label={t('buttonReturnLabel')}
        className="w-full px-14"
        flat
        leftIcon={<MdArrowBack />}
        onClick={modalNavigateWrapper(-1)}
      />
    </div>
  )
}
