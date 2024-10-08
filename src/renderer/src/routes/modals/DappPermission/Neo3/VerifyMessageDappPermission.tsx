import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/Button'
import { DappPermissionContextualMessage } from '@renderer/components/DappPermissionContextualMessage'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'

import { TDappPermissionComponentProps } from '../index'

export const Neo3VerifyMessageDappPermission = ({
  request,
  session,
  onAccept,
  onReject,
}: TDappPermissionComponentProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.verifyMessage' })

  const [isApproving, setIsApproving] = useState(false)

  const params = JSON.stringify(request.params.request.params, null, 4)
  const contextualMessage = request.params.request.params.contextualMessage

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(t('successModal.heading'), t('successModal.subtitle'))
    setIsApproving(false)
  }

  return (
    <div className="flex flex-col flex-grow  min-h-0 overflow-y-auto pr-2 pl-5">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="text-white text-2xl mt-9 text-center">{t('title')}</p>
      </div>

      <div className="mt-8 flex flex-col gap-1 text-xs w-full text-gray-100 flex-grow ">
        <span className="font-bold ">{t('messageLabel')}</span>
        <p className=" bg-asphalt w-full p-2 rounded break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
          {params}
        </p>
      </div>

      {request.params.request.params.contextualMessage && (
        <DappPermissionContextualMessage contextualMessage={String(contextualMessage).trim()} />
      )}

      <div className="flex gap-2.5 px-10 mt-8 pb-10 z-50 ">
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
