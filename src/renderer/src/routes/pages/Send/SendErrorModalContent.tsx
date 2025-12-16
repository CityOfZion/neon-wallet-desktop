import { useTranslation } from 'react-i18next'

type TProps = {
  error: string
}

export const SendErrorModalContent = ({ error }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendFail' })

  return (
    <div className="mt-8 flex w-full flex-col gap-1 text-xs">
      <span className="font-bold">{t('errorMessageLabel')}</span>
      <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
        {error}
      </p>
    </div>
  )
}
