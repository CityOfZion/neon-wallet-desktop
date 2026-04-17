import { useMemo } from 'react'

import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappHeader } from '@renderer/components/DappHeader'
import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { Tooltip } from '@renderer/components/Tooltip'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'
import TbCodeCircle from '@renderer/assets/images/tb-code-circle.svg?react'

import type { TDappPermissionProps } from '../index'
import { DappPermissionGenericContentFee } from './DappPermissionGenericContentFee'

export const DappPermissionGenericContent = (props: TDappPermissionProps) => {
  const { session, onAccept, onReject, isAccepting, isRejecting, request, sessionDetails } = props

  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })

  const parsedParams = useMemo(() => {
    const params = request.params.request.params
    return mapValues(
      isArray(params) && params.length === 1 && isObject(params[0]) ? params[0] : params,
      UtilsHelper.parseJsonSafely
    )
  }, [request.params.request.params])

  const isCalculableMethod = sessionDetails.service.walletConnectService.calculableMethods.includes(
    request.params.request.method
  )

  return (
    <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5 text-white">
      <DappHeader proposerUri={session.peer.metadata.icons[0]} proposerName={session.peer.metadata.name} />

      <p className="mt-4 flex items-center justify-center gap-1.5 text-base text-white">
        <Trans t={t} i18nKey="description" values={{ name: session.peer.metadata.name }}>
          start
          <span className="-mt-px max-w-40 truncate font-bold">middle</span>
          end
        </Trans>
      </p>

      <p className="mt-2 text-center text-sm text-gray-100">{t('description2')}</p>

      <Details.Root className="mt-5">
        <Details.Header leftElement={<TbArrowsSort aria-hidden className="rotate-90" />}>
          <span className="text-sm text-white capitalize">{request.params.request.method}</span>
        </Details.Header>
      </Details.Root>

      {Object.entries(parsedParams).map(([key, value]) => {
        const content = typeof value === 'string' ? value : JSON.stringify(value, null, 4)

        return (
          <Details.Root className="mt-3" key={key}>
            <Details.Header
              rightElement={
                <Tooltip title={tCommon('copy')}>
                  <IconButton
                    aria-label={tCommon('copy')}
                    icon={<MdContentCopy aria-hidden />}
                    size="sm"
                    onClick={ClipboardHelper.write.bind(null, content)}
                  />
                </Tooltip>
              }
              leftElement={<TbCodeCircle aria-hidden className="text-gray-300" />}
            >
              <span className="text-sm text-gray-100 capitalize">{key}</span>
            </Details.Header>

            <Details.HeaderSeparator />

            <Details.Body>
              <p className="rounded bg-gray-700/60 px-5 py-2.5 text-sm wrap-break-word whitespace-pre-wrap">
                {typeof value === 'string' ? value : JSON.stringify(value, null, 4)}
              </p>
            </Details.Body>
          </Details.Root>
        )
      })}

      {isCalculableMethod && <DappPermissionGenericContentFee {...props} />}

      <div className="mt-5 flex gap-2.5">
        <Button
          label={t('rejectButtonLabel')}
          loading={isRejecting}
          disabled={isAccepting}
          className="w-25"
          colorSchema="gray"
          onClick={() => onReject()}
        />

        <Button
          label={t('acceptButtonLabel')}
          className="grow"
          onClick={() => onAccept()}
          loading={isAccepting}
          disabled={isRejecting}
        />
      </div>
    </div>
  )
}
