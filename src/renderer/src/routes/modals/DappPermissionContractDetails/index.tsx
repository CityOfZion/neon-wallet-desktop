import { useMemo } from 'react'

import { hasExplorerService } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { DappHeader } from '@renderer/components/DappHeader'
import { Details } from '@renderer/components/Details'
import { IconLink } from '@renderer/components/IconLink'
import { ScreenLoader } from '@renderer/components/ScreenLoader'
import { Tooltip } from '@renderer/components/Tooltip'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useContract } from '@renderer/hooks/useContract'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

import type { TModalState } from '@shared/types/modal'

const COLORS_BY_TYPE: Record<string, { color: string; textColor: string }> = {
  Signature: {
    color: '#E9265C',
    textColor: 'black',
  },
  Boolean: {
    color: '#D355E7',
    textColor: 'black',
  },
  Integer: {
    color: '#B167F2',
    textColor: 'black',
  },
  Hash160: {
    color: '#008529',
    textColor: 'white',
  },
  Null: {
    color: 'rgba(255, 255, 255, 0.08)',
    textColor: 'black',
  },
  Hash256: {
    color: '#1DB5FF',
    textColor: 'black',
  },
  ByteArray: {
    color: '#0DCDFF',
    textColor: 'black',
  },
  PublicKey: {
    color: '#00D69D',
    textColor: 'black',
  },
  String: {
    color: '#67DD8B',
    textColor: 'black',
  },
  ByteString: {
    color: '#67DD8B',
    textColor: 'black',
  },
  Array: {
    color: '#F28F00',
    textColor: 'black',
  },
  Buffer: {
    color: '#F28F00',
    textColor: 'black',
  },
  InteropInterface: {
    color: '#A50000',
    textColor: 'white',
  },
  Void: {
    color: '#528D93',
    textColor: 'black',
  },
  Any: {
    color: '#00D69D',
    textColor: 'black',
  },
}

export const DappPermissionContractDetailsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermissionContractDetails' })
  const { session, blockchain, hash, operation, values } =
    useModalState<TModalState<'dapp-permission-contract-details'>>()

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  const contractQuery = useContract({ blockchain, hash })

  const params = useMemo(() => {
    if (contractQuery.isLoading || !contractQuery.data) return []

    const methodsInfo = contractQuery.data.methods.find(method => method.name === operation)
    if (!methodsInfo) return []

    const params = methodsInfo.parameters.map((parameter, index) => {
      const value = values[index]
      const stringifiedValue = Array.isArray(value) ? JSON.stringify(value, null, 4) : value
      return {
        ...parameter,
        value: stringifiedValue,
      }
    })

    return params
  }, [contractQuery.data, contractQuery.isLoading, operation, values])

  const getContractHashUrl = () => {
    if (!hasExplorerService(service)) return ''

    try {
      if (hasExplorerService(service)) {
        return service.explorerService.buildContractUrl(hash)
      }
    } catch (error) {
      console.error(error)
    }

    return ''
  }

  return (
    <CenterModalLayout contentClassName="px-0 flex flex-col pb-5 min-h-0">
      {contractQuery.isLoading ? (
        <ScreenLoader />
      ) : (
        <div className="flex min-h-0 grow flex-col overflow-y-auto pr-2 pl-5">
          <DappHeader proposerUri={session.peer.metadata.icons[0]} proposerName={session.peer.metadata.name} />

          <Details.Root className="mt-5">
            <Details.Header
              leftElement={<TbArrowsSort className="rotate-90" aria-hidden />}
              rightElement={
                <p className="text-sm font-semibold text-gray-100 capitalize">{contractQuery.data?.name}</p>
              }
            >
              <p className="text-sm text-white capitalize">{operation}</p>
            </Details.Header>

            <Details.HeaderSeparator />

            <Details.Body>
              <Details.Item
                label={t('hashDetailsHeaderLabel')}
                contentClassName="bg-gray-700/60 px-3 rounded py-1.5 justify-between items-center"
              >
                <p className="truncate text-xs font-bold text-gray-100">{hash}</p>

                <Tooltip title={t('externalButtonLabel')}>
                  <IconLink
                    aria-label={t('externalButtonLabel')}
                    icon={<TbExternalLink aria-hidden className="text-neon" />}
                    size="sm"
                    compacted
                    to={getContractHashUrl()}
                    target="_blank"
                    rel="noreferrer noopener"
                  />
                </Tooltip>
              </Details.Item>
            </Details.Body>
          </Details.Root>

          <p className="mt-5 text-xs font-bold text-gray-300 uppercase">{t('parametersDetailsLabel')}</p>
          {params.map(param => {
            const color = COLORS_BY_TYPE[param.type]

            return (
              <Details.Root className="mt-3" key={param.name}>
                <Details.Header>
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm text-gray-100 capitalize">{param.name}</p>
                    <span
                      className="text-asphalt rounded-full px-3.5 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: color.color,
                        color: color.textColor,
                      }}
                    >
                      {param.type}
                    </span>
                  </div>
                </Details.Header>

                <Details.HeaderSeparator />

                <Details.Body>
                  <Details.Item contentClassName="bg-gray-700/60 px-3 rounded py-1.5" copyable={param.value}>
                    <p className="truncate text-xs font-bold text-gray-100">{param.value}</p>
                  </Details.Item>
                </Details.Body>
              </Details.Root>
            )
          })}
        </div>
      )}
    </CenterModalLayout>
  )
}

export default DappPermissionContractDetailsModal
