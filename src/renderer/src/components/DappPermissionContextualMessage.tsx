import { useTranslation } from 'react-i18next'

type TProps = {
  contextualMessage: string
}

export const DappPermissionContextualMessage = ({ contextualMessage }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'dappPermissionContextualMessage' })
  return (
    <div className="flex flex-col items-center">
      <div className="mt-8 flex flex-col gap-1 text-xs w-full text-gray-100 flex-grow ">
        <span className="font-bold uppercase">{t('messageLabel')}</span>
        <p className=" bg-asphalt w-full p-2 rounded break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
          {contextualMessage}
        </p>
      </div>
    </div>
  )
}
