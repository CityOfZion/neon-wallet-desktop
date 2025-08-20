import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { hasExplorerService } from '@cityofzion/blockchain-service'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'
import { DappPermissionHeader } from '@renderer/components/DappPermissionHeader'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useContract } from '@renderer/hooks/useContract'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TModalState = {
  session: TSession
  hash: string
  operation: string
  blockchain: TBlockchainServiceKey
  values: any[]
}

const COLORS_BY_TYPE = {
  Signature: {
    color: '#E9265C',
    textColor: 'dark',
  },
  Boolean: {
    color: '#D355E7',
    textColor: 'dark',
  },
  Integer: {
    color: '#B167F2',
    textColor: 'dark',
  },
  Hash160: {
    color: '#008529',
    textColor: 'light',
  },
  Null: {
    color: 'rgba(255, 255, 255, 0.08)',
    textColor: 'dark',
  },
  Hash256: {
    color: '#1DB5FF',
    textColor: 'dark',
  },
  ByteArray: {
    color: '#0DCDFF',
    textColor: 'dark',
  },
  PublicKey: {
    color: '#00D69D',
    textColor: 'dark',
  },
  String: {
    color: '#67DD8B',
    textColor: 'dark',
  },
  ByteString: {
    color: '#67DD8B',
    textColor: 'dark',
  },
  Array: {
    color: '#F28F00',
    textColor: 'dark',
  },
  Buffer: {
    color: '#F28F00',
    textColor: 'dark',
  },
  InteropInterface: {
    color: '#A50000',
    textColor: 'light',
  },
  Void: {
    color: '#528D93',
    textColor: 'dark',
  },
  Any: {
    color: '#00D69D',
    textColor: 'dark',
  },
}

export const DappPermissionContractDetailsModal = () => {
  const { session, operation, hash, blockchain, values } = useModalState<TModalState>()
  const { data, isLoading } = useContract({ blockchain, hash })
  const { modalNavigate } = useModalNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermissionContractDetails' })
  const service = bsAggregator.blockchainServicesByName[blockchain]
  let explorerUrl: string | undefined

  if (hasExplorerService(service)) {
    try {
      explorerUrl = service.explorerService.buildContractUrl(hash)
    } catch (error) {
      console.error(error)
    }
  }

  const methodsInfo = data?.methods.find(method => method.name === operation)
  if (!methodsInfo) {
    ToastHelper.error({ message: t('methodNotFoundError') })
    modalNavigate(-1)
    return <></>
  }

  const params = methodsInfo.parameters.map((parameter, index) => {
    const value = values[index]
    const stringifiedValue = Array.isArray(value) ? JSON.stringify(value, null, 4) : value
    return {
      ...parameter,
      value: stringifiedValue,
    }
  })

  const handleHashClick = () => {
    window.open(explorerUrl, '_blank')
  }

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0">
      <div className="flex min-h-0 flex-col overflow-y-auto pl-5 pr-2">
        <DappPermissionHeader session={session} />

        <p className="mb-6 mt-9 text-center text-2xl text-white">{t('title')}</p>

        {isLoading || !data ? (
          <Loader className="text-gray-600" />
        ) : (
          <Fragment>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-100">{t('detailsLabel')}</span>

              <div className="w-full rounded bg-asphalt/50 px-4 pb-5 pt-3 text-sm text-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TbArrowsSort aria-hidden={true} className="h-6 w-6 rotate-90 text-blue" />
                    <p className="capitalize text-white">{operation}</p>
                  </div>

                  <p className="capitalize">{data.name}</p>
                </div>

                <Separator className="mb-4 mt-2.5" />

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">{t('hashLabel')}</span>

                  <div className="flex min-w-0 justify-between gap-3 rounded bg-gray-700/60 py-2.5 pl-5 pr-4">
                    <p className="truncate">{hash}</p>

                    {explorerUrl && (
                      <IconButton
                        icon={<MdLaunch aria-hidden={true} className="text-neon" />}
                        compacted
                        onClick={handleHashClick}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-100">{t('parametersLabel')}</span>

              <div className="flex flex-col gap-2.5">
                {params.map(param => (
                  <div className="w-full rounded bg-asphalt px-4 pb-5 pt-3 text-sm text-gray-100" key={param.name}>
                    <div className="flex items-center gap-5">
                      <p className="capitalize text-gray-100">{param.name}</p>
                      <div
                        className="rounded-full px-3.5 py-1 text-xs text-black"
                        style={{
                          backgroundColor: COLORS_BY_TYPE[param.type].color,
                          color: COLORS_BY_TYPE[param.type].textColor === 'dark' ? 'black' : 'white',
                        }}
                      >
                        {param.type}
                      </div>
                    </div>

                    <Separator className="mb-4 mt-2.5" />

                    <div className="flex min-w-0 justify-between gap-3 rounded bg-gray-700/60 px-4 py-2.5">
                      <p className="min-w-0 whitespace-pre-wrap break-words">{param.value}</p>
                      <IconButton
                        icon={<MdContentCopy aria-hidden={true} className="fill-neon" />}
                        compacted
                        onClick={UtilsHelper.copyToClipboard.bind(null, param.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </CenterModalLayout>
  )
}
