import { Fragment } from 'react'

import type { ContractInvocation, IBSNeo3 } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { IconLink } from '@renderer/components/IconLink'
import { Loader } from '@renderer/components/Loader'
import { Tooltip } from '@renderer/components/Tooltip'

import { useContract } from '@renderer/hooks/useContract'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

import type { TDappPermissionProps } from '../index'

type TProps = {
  invocation: ContractInvocation
} & TDappPermissionProps

export const DappPermissionInvokeNeo3ContentInvocation = ({
  invocation,
  sessionDetails,
  session,
  onReject,
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.customContents.invokeNeo3' })
  const { modalNavigateWrapper } = useModalNavigate()

  const contractQuery = useContract({ blockchain: sessionDetails.blockchain, hash: invocation.scriptHash })

  const service = sessionDetails.service as IBSNeo3

  const amount =
    invocation.operation === 'transfer' && invocation.args?.length === 4 && invocation.args[2].type === 'Integer'
      ? invocation.args[2].value
      : null

  const contractHashUrl = service.explorerService.buildContractUrl(invocation.scriptHash)

  return (
    <Details.Root>
      <Details.Header
        leftElement={<TbArrowsSort className="rotate-90" aria-hidden />}
        rightElement={match(contractQuery)
          .with({ isLoading: true }, () => <Loader className="h-6 w-6 text-gray-300" containerClassName="w-fit" />)
          .with({ data: P.nullish }, () => <Fragment />)
          .otherwise(({ data }) => (
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-100 capitalize">{data.name}</p>

              <Tooltip title={t('viewContractDetailsButtonLabel')}>
                <IconButton
                  aria-label={t('viewContractDetailsButtonLabel')}
                  icon={<MdChevronRight aria-hidden />}
                  colorSchema="gray"
                  size="sm"
                  compacted
                  onClick={modalNavigateWrapper('dapp-permission-contract-details', {
                    state: {
                      session,
                      hash: invocation.scriptHash,
                      operation: invocation.operation,
                      blockchain: sessionDetails.blockchain,
                      values: invocation.args?.map(arg => arg.value) || [],
                      onReject,
                    },
                  })}
                />
              </Tooltip>
            </div>
          ))}
      >
        <p className="text-sm text-white capitalize">{invocation.operation}</p>
      </Details.Header>

      <Details.HeaderSeparator />

      <Details.Body>
        <Details.Item
          label={t('hashDetailsItemLabel')}
          contentClassName="bg-gray-700/60 px-3 rounded py-1.5 justify-between items-center"
        >
          <p className="truncate text-sm text-gray-100">{invocation.scriptHash}</p>

          {contractHashUrl && (
            <Tooltip title={t('externalButtonLabel')}>
              <IconLink
                aria-label={t('externalButtonLabel')}
                icon={<TbExternalLink aria-hidden className="text-neon" />}
                to={contractHashUrl}
                target="_blank"
                rel="noopener noreferrer"
                compacted
                size="sm"
              />
            </Tooltip>
          )}
        </Details.Item>

        {amount && (
          <Details.Item label={t('amountDetailsItemLabel')} contentClassName="bg-gray-700/60 px-3 rounded py-1.5">
            <p className="truncate text-sm text-gray-100">{amount}</p>
          </Details.Item>
        )}
      </Details.Body>
    </Details.Root>
  )
}
