import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  error: Error
}

export const DappPermissionErrorContent = ({ error }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.errorContent' })
  const { modalEraseWrapper } = useModalNavigate()

  return (
    <div className="flex w-full grow flex-col items-center">
      <p className="mt-2 text-xs text-gray-300">{t('description')}</p>

      <div className="my-8 flex min-h-0 w-full grow flex-col gap-1.5 text-sm">
        <p className="text-xs font-bold text-gray-300 uppercase">{t('errorMessageLabel')}</p>

        <p className="bg-asphalt w-full overflow-y-auto rounded p-2 text-sm font-medium wrap-break-word whitespace-pre-wrap text-white">
          {error.message}
        </p>
      </div>

      <Button label={t('doneButtonLabel')} className="mt-auto w-full" onClick={modalEraseWrapper()} />
    </div>
  )
}
