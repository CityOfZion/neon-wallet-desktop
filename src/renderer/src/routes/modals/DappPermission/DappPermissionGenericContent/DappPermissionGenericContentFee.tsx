import { useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Details } from '@renderer/components/Details'
import { Loader } from '@renderer/components/Loader'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'

import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'

import type { TDappPermissionProps } from '../index'

export const DappPermissionGenericContentFee = ({
  request,
  sessionDetails,
  sessionAccount,
  onReject,
}: TDappPermissionProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission' })

  const feeQuery = useQuery({
    queryKey: ['fee', request.id],
    queryFn: async () => {
      const serviceAccount = await AccountHelper.getServiceAccount(sessionAccount)

      return await sessionDetails.service.walletConnectService.calculateRequestFee({
        account: serviceAccount,
        params: request.params.request.params,
      })
    },
    gcTime: 0,
    staleTime: 0,
  })

  useEffect(() => {
    if (!feeQuery.error) return
    onReject({ message: feeQuery.error.message, code: -32000 }, t('errors.fee'))
    LoggerHelper.error(feeQuery.error, { where: 'DappPermissionGenericContentFee', operation: 'calculateRequestFee' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeQuery.error])

  return (
    <Details.Root className="mt-3">
      <Details.Header
        leftElement={<TbReceipt aria-hidden className="text-blue" />}
        rightElement={
          <div>
            {feeQuery.isLoading || !feeQuery.data ? (
              <Loader className="text-gray-100" />
            ) : (
              <p className="text-sm font-semibold text-gray-100">
                {feeQuery.data} {sessionDetails.service.feeToken.symbol}
              </p>
            )}
          </div>
        }
      >
        <p className="text-sm text-white">{t('feeLabel')}</p>
      </Details.Header>
    </Details.Root>
  )
}
