import { useTranslation } from 'react-i18next'

type TProps = {
  error: string
}

export const SendErrorModalContent = ({ error }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })

  return (
    <div className="flex w-full min-w-0 grow flex-col text-gray-100">
      <p className="mt-4 px-9 text-center text-sm">{t('errorModal.text')}</p>

      <div className="mt-8 flex w-full flex-col gap-1 text-xs">
        <span className="font-bold">{t('errorModal.errorMessageLabel')}</span>
        <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
          {error}
        </p>
      </div>
    </div>
  )
}
