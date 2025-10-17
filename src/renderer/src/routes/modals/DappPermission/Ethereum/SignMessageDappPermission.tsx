import { useState } from 'react'

import { utils } from 'ethers'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'

import { TDappPermissionComponentProps } from '../index'

export const EthereumSignMessageDappPermission = ({
  onAccept,
  onReject,
  request,
  session,
}: TDappPermissionComponentProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.ethereum.signMessage' })

  const [isApproving, setIsApproving] = useState(false)

  const message = request.params.request.params.filter((p: string) => !utils.isAddress(p))[0]
  const convertedMessage = utils.isHexString(message) ? utils.toUtf8String(message) : message

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(t('successModal.heading'), t('successModal.subtitle'))
    setIsApproving(false)
  }

  return (
    <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="mt-9 text-center text-2xl text-white">{t('title')}</p>
      </div>

      <div className="mt-8 flex w-full grow flex-col gap-1 text-xs text-gray-100">
        <span className="font-bold">{t('messageLabel')}</span>
        <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
          {convertedMessage}
        </p>
      </div>

      <div className="z-50 mt-8 flex gap-2.5 px-10 pb-10">
        <Button label={t('cancelButtonLabel')} colorSchema="gray" onClick={() => onReject()} />

        <Button
          label={t('acceptButtonLabel')}
          className="grow"
          onClick={handleAccept}
          loading={isApproving}
          disabled={isApproving}
        />
      </div>
    </div>
  )
}
