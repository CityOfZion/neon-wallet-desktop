import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TSession, TSessionRequest } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Loader } from '@renderer/components/Loader'
import { walletConnectEIP155Adapter } from '@renderer/libs/walletConnectSDK'
import { useQuery } from '@tanstack/react-query'

type TProps = {
  request: TSessionRequest
  session: TSession
  onReject: (errorToast?: string, errorDapp?: string) => void
}

export const Fee = ({ request, session, onReject }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.ethereum.fee' })

  const {
    data: fee,
    isLoading: feeIsLoading,
    error: feeError,
  } = useQuery({
    queryKey: ['fee', request.id],
    queryFn: async () => {
      const total = await walletConnectEIP155Adapter.calculateFee({ request, session })
      return total
    },
    gcTime: 0,
    staleTime: 0,
  })

  useEffect(() => {
    if (!feeError) return
    console.error(feeError)
    onReject(t('feeError'), feeError.message)
  }, [feeError, onReject, t])

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold">{t('label')}</span>

      <div className="pr-4 pl-5 bg-asphalt py-2.5 rounded min-w-0 gap-3">
        {feeIsLoading ? <Loader className="w-4 h-4" /> : <p>{t('fee', { fee: fee })}</p>}
      </div>
    </div>
  )
}
