import { useEffect } from 'react'

import type { ContractInvocationMulti } from '@cityofzion/bs-neo3'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappHeader } from '@renderer/components/DappHeader'
import { Details } from '@renderer/components/Details'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'

import { DappPermissionGenericContentFee } from '../DappPermissionGenericContent/DappPermissionGenericContentFee'
import type { TDappPermissionProps } from '../index'
import { DappPermissionInvokeNeo3ContentInvocation } from './DappPermissionInvokeNeo3ContentInvocation'
import { DappPermissionInvokeNeo3ContentSigner } from './DappPermissionInvokeNeo3ContentSigner'

export const DappPermissionInvokeNeo3Content = (props: TDappPermissionProps) => {
  const { session, onAccept, onReject, isAccepting, isRejecting, request } = props

  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })

  const params = request.params.request.params as ContractInvocationMulti

  useEffect(() => {
    if (params.extraNetworkFee || params.extraSystemFee || params.systemFeeOverride || params.networkFeeOverride) {
      ToastHelper.info({ message: t('feeOverridesMessage'), id: 'dapp-permission-fee-overrides' })
    }
  }, [params, t])

  return (
    <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5">
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

      <ul className="mt-3 flex w-full flex-col gap-2.5">
        {params.invocations.map((invocation, index) => (
          <li key={`invocations-${index}`} className="w-full">
            <DappPermissionInvokeNeo3ContentInvocation {...props} invocation={invocation} />
          </li>
        ))}
      </ul>

      <ul className="mt-3 flex w-full flex-col gap-2.5">
        {params.signers?.map((signer, index) => (
          <li key={`signer-${index}`} className="w-full">
            <DappPermissionInvokeNeo3ContentSigner {...props} signer={signer} />
          </li>
        ))}
      </ul>

      <DappPermissionGenericContentFee {...props} />

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
