import { useTranslation } from 'react-i18next'

type TProps = {
  contextualMessage: string
}

export const DappPermissionContextualMessage = ({ contextualMessage }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'dappPermissionContextualMessage' })
  return (
    <div className="flex flex-col items-center">
      <div className="mt-8 flex w-full grow flex-col gap-1 text-xs text-gray-100">
        <span className="font-bold uppercase">{t('messageLabel')}</span>
        <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
          {contextualMessage}
        </p>
      </div>
    </div>
  )
}
