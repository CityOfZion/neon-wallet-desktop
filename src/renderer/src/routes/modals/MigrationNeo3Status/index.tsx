import { useTranslation } from 'react-i18next'

import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { Link } from '@renderer/components/Link'
import { Tooltip } from '@renderer/components/Tooltip'

import { useAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useMigrationNeo3Selector } from '@renderer/hooks/useUtilitySelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdRefresh from '@renderer/assets/images/md-refresh.svg?react'
import TbArrowsExchange from '@renderer/assets/images/tb-arrows-exchange.svg?react'
import TbClockExclamation from '@renderer/assets/images/tb-clock-exclamation.svg?react'
import TbEye from '@renderer/assets/images/tb-eye.svg?react'
import TbHourglass from '@renderer/assets/images/tb-hourglass.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import { NEO_LEGACY_GAS_TOKEN, NEO_LEGACY_NEO_TOKEN, NEO3_GAS_TOKEN, NEO3_NEO_TOKEN } from '@renderer/constants/tokens'
import { thunks } from '@renderer/store/thunks'

import { MigrationNeo3StatusAssetItem } from './MigrationNeo3StatusAssetItem'

type TState = {
  hash: string
}

const iconsByStatus = {
  failure: <TbClockExclamation aria-hidden className="text-orange h-4/5 w-4/5 stroke-1" />,
  'failure-neo3': <TbClockExclamation aria-hidden className="text-orange h-4/5 w-4/5 stroke-1" />,
  done: <TbRosetteDiscountCheck aria-hidden className="text-blue h-full w-full stroke-1" />,
  pending: (
    <TbHourglass
      aria-hidden
      className="text-blue h-full w-full animate-[wiggle_2s_ease-in-out_infinite] stroke-1 p-1"
    />
  ),
}

const MigrationNeo3StatusModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrationNeo3Status' })
  const { modalEraseWrapper } = useModalNavigate()
  const { hash } = useModalState<TState>()
  const dispatch = useAppDispatch()

  const { migrationNeo3 } = useMigrationNeo3Selector(hash)
  const { account: updatedNeoLegacyAccount } = useAccountSelector(migrationNeo3.neoLegacyAccount)

  const isCheckFailure = migrationNeo3.status === 'failure' || migrationNeo3.status === 'failure-neo3'

  const handleRevalidateMigration = () => {
    if (!isCheckFailure) return
    dispatch(thunks.waitMigration(migrationNeo3))
  }

  return (
    <SideModalLayout
      heading={t('title')}
      contentClassName="flex flex-col items-center overflow-auto gap-y-6"
      headingIcon={<TbArrowsExchange aria-hidden />}
    >
      <div className="bg-asphalt flex min-h-30 min-w-30 items-center justify-center rounded-full p-1">
        {iconsByStatus[migrationNeo3.status]}
      </div>

      <h2 className="text-center text-xl text-white">{t(`subtitles.${migrationNeo3.status}`)}</h2>

      <Details.Root>
        <Details.Header label={t('detailsHeaderLabel')} icon={<TbReceipt aria-hidden />}>
          {isCheckFailure && (
            <div className="flex grow flex-row items-center justify-end">
              <Tooltip title={t('revalidateMigrationButtonLabel')} delayDuration={0}>
                <IconButton
                  aria-label={t('revalidateMigrationButtonLabel')}
                  colorSchema="yellow"
                  size="xs"
                  compacted
                  icon={<MdRefresh aria-hidden className="h-6 w-6" />}
                  onClick={handleRevalidateMigration}
                />
              </Tooltip>
            </div>
          )}
        </Details.Header>

        <Details.Body className="text-sm">
          <Details.Panel label={t('detailsPanelLabel')}>
            <Details.Item
              label={t('detailsDestinationAddressLabel')}
              copyable={migrationNeo3.neo3Address}
              contentClassName="justify-between"
            >
              {migrationNeo3.neo3Address}
            </Details.Item>

            <Details.Item label={t('detailsAmountSentLabel')} contentClassName="flex flex-col items-start gap-y-1">
              {migrationNeo3.neoLegacyMigrationAmounts.gasBalance && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neoLegacyMigrationAmounts.gasBalance.amount}
                  token={NEO_LEGACY_GAS_TOKEN}
                  blockchain="neoLegacy"
                />
              )}

              {migrationNeo3.neoLegacyMigrationAmounts.neoBalance && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neoLegacyMigrationAmounts.neoBalance.amount}
                  token={NEO_LEGACY_NEO_TOKEN}
                  blockchain="neoLegacy"
                />
              )}
            </Details.Item>

            <Details.Item label={t('detailsMigrationFeeLabel')} contentClassName="flex flex-col items-start gap-y-1">
              {migrationNeo3.neo3MigrationAmounts.gasMigrationTotalFees && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3MigrationAmounts.gasMigrationTotalFees}
                  token={NEO3_GAS_TOKEN}
                  blockchain="neo3"
                />
              )}

              {migrationNeo3.neo3MigrationAmounts.neoMigrationTotalFees && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3MigrationAmounts.neoMigrationTotalFees}
                  token={NEO3_NEO_TOKEN}
                  blockchain="neo3"
                />
              )}
            </Details.Item>

            <Details.Item
              label={t(`detailsAmountReceiveLabel.${migrationNeo3.status}`)}
              contentClassName="flex flex-col items-start gap-y-1"
            >
              {migrationNeo3.neo3MigrationAmounts.gasMigrationReceiveAmount && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3MigrationAmounts.gasMigrationReceiveAmount}
                  token={NEO3_GAS_TOKEN}
                  blockchain="neo3"
                />
              )}

              {migrationNeo3.neo3MigrationAmounts.neoMigrationReceiveAmount && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3MigrationAmounts.neoMigrationReceiveAmount}
                  token={NEO3_NEO_TOKEN}
                  blockchain="neo3"
                />
              )}
            </Details.Item>

            <Details.Item label={t('detailsTransactionHashLabel')} copyable={hash} contentClassName="justify-between">
              {hash}
            </Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      {updatedNeoLegacyAccount && (
        <Link
          label={t('viewStatusButtonLabel')}
          className="mx-auto w-full max-w-64"
          to={`/wallets/${updatedNeoLegacyAccount.id}/transactions`}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<TbEye aria-hidden />}
          onClick={modalEraseWrapper('side')}
        />
      )}
    </SideModalLayout>
  )
}

export default MigrationNeo3StatusModal
