import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/Button'
import { DappPermissionContextualMessage } from '@renderer/components/DappPermissionContextualMessage'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'

import { TDappPermissionComponentProps } from '../index'

export const Neo3SignMessageDappPermission = ({
  request,
  session,
  onAccept,
  onReject,
}: TDappPermissionComponentProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.signMessage' })

  const [isApproving, setIsApproving] = useState(false)

  const message = request.params.request.params.message
  const contextualMessage = request.params.request.params.contextualMessage

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(t('successModal.heading'), t('successModal.subtitle'))
    setIsApproving(false)
  }

  return (
    <div className="flex min-h-0 flex-grow flex-col overflow-y-auto pl-5 pr-2">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="mt-9 text-center text-2xl text-white">{t('title')}</p>
      </div>

      <div className="mt-8 flex w-full flex-grow flex-col gap-1 text-xs text-gray-100">
        <span className="font-bold">{t('messageLabel')}</span>
        <p className="max-h-48 w-full overflow-y-auto whitespace-pre-wrap break-words rounded bg-asphalt p-2">
          {message}
        </p>
      </div>

      {request.params.request.params.contextualMessage && (
        <DappPermissionContextualMessage contextualMessage={String(contextualMessage).trim()} />
      )}

      <div className="z-50 mt-8 flex gap-2.5 px-10 pb-10">
        <Button label={t('cancelButtonLabel')} colorSchema="gray" onClick={() => onReject()} />

        <Button
          label={t('acceptButtonLabel')}
          className="flex-grow"
          onClick={handleAccept}
          loading={isApproving}
          disabled={isApproving}
        />
      </div>
    </div>
  )
}
