import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EncryptedPayload } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Button } from '@renderer/components/Button'
import { DappPermissionContextualMessage } from '@renderer/components/DappPermissionContextualMessage'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'

import { TDappPermissionComponentProps } from '../index'

export const Neo3DecryptFromArrayDappPermission = ({
  request,
  session,
  onAccept,
  onReject,
}: TDappPermissionComponentProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.decrypt' })

  const [isApproving, setIsApproving] = useState(false)

  const params = request.params.request.params[0] as EncryptedPayload[]
  const contextualMessage = request.params.request.params.contextualMessage

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(t('successModal.heading'), t('successModal.subtitle'))
    setIsApproving(false)
  }

  return (
    <div className="flex flex-col flex-grow min-h-0 overflow-y-auto pr-2 pl-5">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="text-white text-2xl mt-9 text-center">{t('title')}</p>
      </div>

      <div className="text-gray-100 text-sm flex flex-col flex-grow gap-3 mt-8">
        {params.map((param, index) => (
          <div key={index} className="bg-asphalt p-4 rounded flex flex-col gap-2">
            {Object.entries(param).map(([key, value]) => (
              <div className="flex flex-col gap-1" key={key}>
                <span className="text-xs font-bold">{key}</span>

                <div className="flex justify-between px-5 bg-gray-700/60 py-2.5 rounded min-w-0 gap-3">
                  <p className="break-words min-w-0">{value}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
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
