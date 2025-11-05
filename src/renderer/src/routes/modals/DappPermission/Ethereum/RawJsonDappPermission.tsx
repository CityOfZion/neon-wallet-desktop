import { type JSX, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'
import { IconButton } from '@renderer/components/IconButton'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'

import { TDappPermissionComponentProps } from '..'

type TProps = TDappPermissionComponentProps & {
  successHeading: string
  successSubtitle: string
  successContent?: (props: any) => JSX.Element
  title: string
  fee?: (props: any) => JSX.Element
}

export const EthereumRawJsonDappPermission = ({
  session,
  onAccept,
  onReject,
  request,
  successHeading,
  title,
  successSubtitle,
  successContent,
  fee,
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.ethereum.rawJson' })

  const [isApproving, setIsApproving] = useState(false)

  const array = request.params.request.params.map((item: any) => {
    try {
      return JSON.parse(item)
    } catch {
      return item
    }
  })

  const json = JSON.stringify(array, null, 4)

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(successHeading, successSubtitle, successContent)
    setIsApproving(false)
  }

  return (
    <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="mt-9 text-center text-2xl text-white">{title}</p>
      </div>

      <div className="mt-8 flex w-full grow flex-col gap-2 text-xs text-gray-100">
        <span className="font-bold">{t('dataLabel')}</span>
        <div className="bg-asphalt relative max-h-48 w-full overflow-y-auto rounded-sm p-2 wrap-break-word whitespace-pre-wrap">
          {json}

          <IconButton
            className="absolute top-2 right-2"
            icon={<MdContentCopy aria-hidden className="text-neon" />}
            compacted
            onClick={UtilsHelper.copyToClipboard.bind(null, json)}
          />
        </div>

        {fee && fee({ request: request, session: session, onReject: onReject })}
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
