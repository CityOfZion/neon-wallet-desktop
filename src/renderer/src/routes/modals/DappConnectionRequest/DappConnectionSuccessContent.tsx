import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdArrowBack from '@renderer/assets/images/md-arrow-back.svg?react'

export const DappConnectionSuccessContent = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnectionRequest.successModal' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex w-full grow items-end justify-center">
      <Button
        label={t('buttonReturnLabel')}
        className="w-full px-14"
        flat
        leftIcon={<MdArrowBack />}
        onClick={modalNavigateWrapper(-2)}
      />
    </div>
  )
}
