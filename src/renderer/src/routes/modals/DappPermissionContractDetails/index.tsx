import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { MdContentCopy, MdLaunch } from 'react-icons/md'
import { TbArrowsSort } from 'react-icons/tb'
import { hasExplorerService } from '@cityofzion/blockchain-service'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-react'
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
    const service = bsAggregator.blockchainServicesByName[blockchain]
    if (!hasExplorerService(service)) return

    window.open(service.explorerService.buildContractUrl(hash), '_blank')
  }

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0">
      <div className="flex flex-col min-h-0 overflow-y-auto pr-2 pl-5">
        <DappPermissionHeader session={session} />

        <p className="text-center text-white text-2xl mt-9 mb-6">{t('title')}</p>

        {isLoading || !data ? (
          <Loader className="text-gray-600" />
        ) : (
          <Fragment>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-100">{t('detailsLabel')}</span>

              <div className="px-4 pt-3 pb-5 bg-asphalt/50 text-gray-100 rounded w-full text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2.5 items-center">
                    <TbArrowsSort className="w-6 h-6 rotate-90 text-blue" />
                    <p className="capitalize text-white">{operation}</p>
                  </div>

                  <p className="capitalize">{data.name}</p>
                </div>

                <Separator className="mt-2.5 mb-4" />

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold">{t('hashLabel')}</span>

                  <div className="flex justify-between pr-4 pl-5 bg-gray-700/60 py-2.5 rounded min-w-0 gap-3">
                    <p className="truncate">{hash}</p>
                    <IconButton icon={<MdLaunch className="text-neon" />} compacted onClick={handleHashClick} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-7">
              <span className="text-xs font-bold text-gray-100">{t('parametersLabel')}</span>

              <div className="flex flex-col gap-2.5">
                {params.map(param => (
                  <div className="px-4 pt-3 pb-5 bg-asphalt text-gray-100 rounded w-full text-sm" key={param.name}>
                    <div className="flex items-center gap-5">
                      <p className="capitalize text-gray-100">{param.name}</p>
                      <div
                        className="rounded-full px-3.5 py-1 text-asphalt text-xs"
                        style={{
                          backgroundColor: COLORS_BY_TYPE[param.type].color,
                          color: COLORS_BY_TYPE[param.type].textColor === 'dark' ? 'black' : 'white',
                        }}
                      >
                        {param.type}
                      </div>
                    </div>

                    <Separator className="mt-2.5 mb-4" />

                    <div className="flex justify-between px-4 bg-gray-700/60 py-2.5 rounded min-w-0 gap-3">
                      <p className="break-words whitespace-pre-wrap min-w-0">{param.value}</p>
                      <IconButton
                        icon={<MdContentCopy className="fill-neon" />}
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
