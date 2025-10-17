import { Fragment, type JSX, useEffect, useMemo, useState } from 'react'

import { ContractInvocationMulti } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { DappPermissionContextualMessage } from '@renderer/components/DappPermissionContextualMessage'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'
import { Separator } from '@renderer/components/Separator'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { walletConnectNeonAdapter } from '@renderer/libs/walletConnectSDK'

import { TDappPermissionComponentProps } from '../../index'
import { Fee } from './Fee'
import { Invocation } from './Invocation'
import { Signer } from './Signer'

type TProps = TDappPermissionComponentProps & {
  successHeading: string
  successSubtitle: string
  successContent?: (props: any) => JSX.Element
  title: string
}

export const Neo3ContractInvocationDappPermission = ({
  request,
  session,
  sessionInfo,
  onReject,
  onAccept,
  successHeading,
  successSubtitle,
  title,
  successContent,
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.contractInvocation' })
  const params = useMemo(() => request.params.request.params as ContractInvocationMulti, [request])

  const contextualMessage = request.params.request.params.contextualMessage

  const {
    data: fee,
    isLoading: feeIsLoading,
    error: feeError,
  } = useQuery({
    queryKey: ['fee', request.id],
    queryFn: async () => {
      const { total } = await walletConnectNeonAdapter.calculateFee({ request, session })
      return total
    },
    gcTime: 0,
    staleTime: 0,
  })

  const [isApproving, setIsApproving] = useState(false)

  const handleAccept = async () => {
    setIsApproving(true)
    await onAccept(successHeading, successSubtitle, successContent)
    setIsApproving(false)
  }

  useEffect(() => {
    if (!feeError) return
    console.error(feeError)
    onReject(t('feeError'), feeError.message)
  }, [feeError, onReject, t])

  useEffect(() => {
    if (params.extraNetworkFee || params.extraSystemFee || params.systemFeeOverride || params.networkFeeOverride) {
      ToastHelper.info({ message: t('overrideFeeInfo'), id: 'dapp-permission-override-fee' })
    }
  }, [t, params])

  return (
    <div className="flex min-h-0 flex-col overflow-y-auto pr-2 pl-5">
      <DappPermissionHeader session={session} />

      <div className="flex flex-col items-center">
        <p className="mt-9 text-center text-2xl text-white">{title}</p>

        <p className="my-5 text-sm text-gray-100">{t('subtitle')}</p>

        <ul className="flex w-full flex-col gap-2.5">
          {params.invocations.map((invocation, index) => (
            <li key={`invocations-${index}`} className="w-full">
              <Invocation invocation={invocation} session={session} blockchain={sessionInfo.blockchain} />
            </li>
          ))}
        </ul>

        <div className="bg-asphalt mt-2.5 w-full rounded-sm px-4 pt-3 pb-5 text-sm text-gray-100">
          {params.signers && (
            <Fragment>
              <ul className="flex flex-col gap-2">
                {params.signers.map((signer, index) => (
                  <li key={`signers-${index}`}>
                    <Signer signer={signer} session={session} />
                  </li>
                ))}
              </ul>
              <Separator className="mt-3 mb-4" />
            </Fragment>
          )}

          <Fee loading={feeIsLoading} fee={fee} />
        </div>
      </div>

      {request.params.request.params.contextualMessage && (
        <DappPermissionContextualMessage contextualMessage={String(contextualMessage).trim()} />
      )}

      <div className="z-50 mt-8 flex gap-2.5 px-10 pb-10">
        <Button label={t('cancelButtonLabel')} colorSchema="gray" onClick={() => onReject()} />
        <Button
          label={t('acceptButtonLabel')}
          className="grow"
          onClick={handleAccept}
          loading={isApproving}
          disabled={feeIsLoading || isApproving}
        />
      </div>
    </div>
  )
}
