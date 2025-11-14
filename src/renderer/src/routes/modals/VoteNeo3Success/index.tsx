import { BSNeo3Constants } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'
import { Tooltip } from '@renderer/components/Tooltip'

import { StringHelper } from '@renderer/helpers/StringHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useVoteNeo3GetVoteDetailsByAddress } from '@renderer/hooks/useVoteNeo3'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbEye from '@renderer/assets/images/tb-eye.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import type { TModalState } from '@shared/types/modal'

const VoteNeo3SuccessModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3Success' })
  const { modalEraseWrapper } = useModalNavigate()
  const { neo3Account, candidate } = useModalState<TModalState<'vote-neo3-success'>>()
  const voteDetailsByAddressQuery = useVoteNeo3GetVoteDetailsByAddress(neo3Account.address)

  const neoAmount = voteDetailsByAddressQuery.data?.neoBalance ?? 0

  return (
    <CenterModalLayout
      heading={t('title')}
      headerClassName="pt-3"
      headingIcon={<TbChartBarPopular aria-hidden />}
      className="overflow-y-auto"
      contentClassName="pb-0 px-4 pt-8 my-0 flex flex-col text-sm text-white"
    >
      <div className="flex h-full flex-col gap-y-3">
        <TbRosetteDiscountCheck
          aria-hidden
          className="bg-asphalt text-blue mx-auto h-24 max-h-24 min-h-24 w-24 max-w-24 min-w-24 rounded-full stroke-1 p-1"
        />

        <h3 className="mt-2 text-center text-lg font-medium">{t('subtitle')}</h3>

        {!!neoAmount && (
          <>
            <strong className="mt-4 font-semibold text-gray-100 uppercase">{t('listLabel')}</strong>

            <ul className="flex flex-col gap-y-3 rounded-sm bg-gray-700/60 px-4 py-3">
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('accountLabel')}</span>
                <span className="w-full max-w-72 truncate">{neo3Account.name}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('addressLabel')}</span>
                <span className="w-full max-w-72 truncate">{neo3Account.address}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('nameLabel')}</span>
                <span className="w-full max-w-72 truncate">{candidate.name}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('publicKeyLabel')}</span>
                <Tooltip
                  title={candidate.pubKey}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-56' }}
                >
                  <span>{StringHelper.truncateStringMiddle(candidate.pubKey, 28)}</span>
                </Tooltip>
              </li>
              <li className="flex items-center gap-x-3">
                <span className="text-blue">{t('votesLabel')}</span>
                <span className="w-full max-w-72 truncate">
                  {neoAmount} {BSNeo3Constants.NEO_TOKEN.symbol}
                </span>
              </li>
            </ul>

            <div className="mb-8 flex grow items-end">
              <Link
                label={t('viewTransactionButtonLabel')}
                to={`/wallets/${neo3Account.id}/transactions`}
                className="mx-auto mt-6 w-full max-w-64"
                flat
                wide
                iconsOnEdge={false}
                rightIcon={<TbEye aria-hidden />}
                onClick={modalEraseWrapper()}
              />
            </div>
          </>
        )}
      </div>
    </CenterModalLayout>
  )
}

export default VoteNeo3SuccessModal
