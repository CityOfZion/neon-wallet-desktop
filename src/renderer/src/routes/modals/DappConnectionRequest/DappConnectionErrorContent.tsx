import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdArrowBack from '@renderer/assets/images/md-arrow-back.svg?react'

type TProps = {
  error: string
}

export const DappConnectionErrorContent = ({ error }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappConnectionRequest.errorModal' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="mt-2.5 flex w-full grow flex-col items-center justify-between">
      <div className="flex w-full flex-col items-center gap-y-2.5">
        <p className="text-lg text-gray-100">{t('subtitle2')}</p>

        <div className="mt-8 flex w-full flex-col gap-1 text-xs">
          <strong>{t('errorMessageLabel')}</strong>

          <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
            {error}
          </p>
        </div>
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
