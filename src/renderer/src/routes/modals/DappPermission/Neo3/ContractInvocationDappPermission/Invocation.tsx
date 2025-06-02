import { useTranslation } from 'react-i18next'
import { MdChevronRight, MdLaunch } from 'react-icons/md'
import { TbArrowsSort } from 'react-icons/tb'
import { hasExplorerService } from '@cityofzion/blockchain-service'
import { ContractInvocation, TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import { Separator } from '@radix-ui/react-select'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { useContract } from '@renderer/hooks/useContract'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TProps = {
  invocation: ContractInvocation
  session: TSession
  blockchain: TBlockchainServiceKey
}

export const Invocation = ({ invocation, session, blockchain }: TProps) => {
  const { data, isLoading } = useContract({ blockchain, hash: invocation.scriptHash })
  const { modalNavigateWrapper } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.contractInvocation' })
  const service = bsAggregator.blockchainServicesByName[blockchain]
  let explorerUrl

  if (hasExplorerService(service)) {
    try {
      explorerUrl = service.explorerService.buildContractUrl(invocation.scriptHash)
    } catch (error) {
      console.error(error)
    }
  }

  const handleHashClick = () => {
    window.open(explorerUrl, '_blank')
  }

  const showAmount =
    invocation.operation === 'transfer' && invocation.args?.length === 4 && invocation.args[2].type === 'Integer'

  return (
    <div className="w-full rounded bg-asphalt px-4 pb-5 pt-3 text-sm text-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TbArrowsSort aria-hidden={true} className="h-6 w-6 rotate-90 text-blue" />
          <p className="capitalize text-white">{invocation.operation}</p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? <Loader className="h-4 w-4" /> : data && <p className="capitalize">{data.name}</p>}

          <IconButton
            icon={<MdChevronRight aria-hidden={true} className="text-gray-100" />}
            compacted
            onClick={modalNavigateWrapper('dapp-permission-contract-details', {
              state: {
                session,
                hash: invocation.scriptHash,
                operation: invocation.operation,
                blockchain,
                values: invocation.args?.map(arg => arg.value) ?? [],
              },
            })}
          />
        </div>
      </div>

      <Separator className="mb-4 mt-3" />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold">{t('hashLabel')}</span>

        <div className="flex min-w-0 justify-between gap-3 rounded bg-gray-700/60 py-2.5 pl-5 pr-4">
          <p className="truncate">{invocation.scriptHash}</p>
          {explorerUrl && (
            <IconButton
              icon={<MdLaunch aria-hidden={true} className="text-neon" />}
              compacted
              onClick={handleHashClick}
            />
          )}
        </div>
      </div>
      {showAmount && (
        <div className="flex flex-col gap-1">
          <div className="mb-4 mt-4 h-px min-h-[0.0625rem] w-full bg-gray-300/30"></div>
          <span className="text-xs font-bold">{t('amountLabel')}</span>

          <div className="flex min-w-0 justify-between gap-3 rounded bg-gray-700/60 py-2.5 pl-5 pr-4">
            <p className="truncate">{invocation.args?.[2].value}</p>
          </div>
        </div>
      )}
    </div>
  )
}
