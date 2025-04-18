import { useTranslation } from 'react-i18next'
import { MdRefresh } from 'react-icons/md'
import {
  TbArrowsExchange,
  TbClockExclamation,
  TbEye,
  TbHourglass,
  TbReceipt,
  TbRosetteDiscountCheck,
} from 'react-icons/tb'
import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { Link } from '@renderer/components/Link'
import { Tooltip } from '@renderer/components/Tooltip'
import {
  NEO_LEGACY_GAS_TOKEN,
  NEO_LEGACY_NEO_TOKEN,
  NEO3_GAS_TOKEN,
  NEO3_NEO_TOKEN,
} from '@renderer/constants/migration-neo3'
import { useAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useMigrationNeo3Selector } from '@renderer/hooks/useUtilitySelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { thunks } from '@renderer/store/thunks'

import { MigrationNeo3StatusAssetItem } from './MigrationNeo3StatusAssetItem'

type TState = {
  hash: string
}

const iconsByStatus = {
  failure: <TbClockExclamation aria-hidden className="text-orange w-4/5 h-4/5 stroke-1" />,
  'failure-neo3': <TbClockExclamation aria-hidden className="text-orange w-4/5 h-4/5 stroke-1" />,
  done: <TbRosetteDiscountCheck aria-hidden className="text-blue w-full h-full stroke-1" />,
  pending: (
    <TbHourglass
      aria-hidden
      className="text-blue p-1 animate-[wiggle_2s_ease-in-out_infinite] w-full h-full stroke-1"
    />
  ),
}

export const MigrationNeo3StatusModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrationNeo3Status' })
  const { modalEraseWrapper } = useModalNavigate()
  const { hash } = useModalState<TState>()
  const dispatch = useAppDispatch()

  const { migrationNeo3 } = useMigrationNeo3Selector(hash)
  const { account: updatedNeoLegacyAccount } = useAccountSelector(migrationNeo3.neoLegacyAccount)

  const isCheckFailure = true

  const handleRevalidateMigration = () => {
    if (!isCheckFailure) return
    dispatch(thunks.waitMigration(migrationNeo3))
  }

  return (
    <SideModalLayout
      heading={t('title')}
      contentClassName="flex flex-col items-center overflow-auto gap-y-6"
      headingIcon={<TbArrowsExchange aria-hidden={true} />}
    >
      <div className="flex items-center justify-center min-w-30 min-h-30 p-1 bg-asphalt rounded-full">
        {iconsByStatus[migrationNeo3.status]}
      </div>

      <h2 className="text-white text-xl text-center">{t(`subtitles.${migrationNeo3.status}`)}</h2>

      <Details.Root>
        <Details.Header label={t('detailsHeaderLabel')} icon={<TbReceipt />}>
          {isCheckFailure && (
            <div className="flex flex-row flex-grow items-center justify-end">
              <Tooltip title={t('revalidateMigrationButtonLabel')} delayDuration={0}>
                <IconButton
                  aria-label={t('revalidateMigrationButtonLabel')}
                  colorSchema="yellow"
                  size="xs"
                  compacted
                  icon={<MdRefresh aria-hidden className="w-6 h-6" />}
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
          className="w-full max-w-64 mx-auto"
          to={`/app/wallets/${updatedNeoLegacyAccount.id}/transactions`}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<TbEye aria-hidden={true} />}
          onClick={modalEraseWrapper('center')}
        />
      )}
    </SideModalLayout>
  )
}
