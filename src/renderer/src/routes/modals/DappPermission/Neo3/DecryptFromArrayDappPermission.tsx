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
    <div className="flex min-h-0 flex-grow flex-col overflow-y-auto pl-5 pr-2">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="mt-9 text-center text-2xl text-white">{t('title')}</p>
      </div>

      <div className="mt-8 flex flex-grow flex-col gap-3 text-sm text-gray-100">
        {params.map((param, index) => (
          <div key={index} className="flex flex-col gap-2 rounded bg-asphalt p-4">
            {Object.entries(param).map(([key, value]) => (
              <div className="flex flex-col gap-1" key={key}>
                <span className="text-xs font-bold">{key}</span>

                <div className="flex min-w-0 justify-between gap-3 rounded bg-gray-700/60 px-5 py-2.5">
                  <p className="min-w-0 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
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
