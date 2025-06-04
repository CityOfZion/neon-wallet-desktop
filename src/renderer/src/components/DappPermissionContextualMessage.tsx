import { useTranslation } from 'react-i18next'

type TProps = {
  contextualMessage: string
}

export const DappPermissionContextualMessage = ({ contextualMessage }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'dappPermissionContextualMessage' })
  return (
    <div className="flex flex-col items-center">
      <div className="mt-8 flex w-full flex-grow flex-col gap-1 text-xs text-gray-100">
        <span className="font-bold uppercase">{t('messageLabel')}</span>
        <p className="max-h-48 w-full overflow-y-auto whitespace-pre-wrap break-words rounded bg-asphalt p-2">
          {contextualMessage}
        </p>
      </div>
    </div>
  )
}
