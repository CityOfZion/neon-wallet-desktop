import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { MdRefresh } from 'react-icons/md'
import { TbArrowsExchange, TbCircleX, TbEye, TbHourglass, TbReceipt, TbRosetteDiscountCheck } from 'react-icons/tb'
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
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useMigrationNeo3Selector } from '@renderer/hooks/useUtilitySelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { thunks } from '@renderer/store/thunks'
import { TFailureMigrationNeo3 } from '@shared/@types/store'
import { match } from 'ts-pattern'

import { MigrationNeo3StatusAssetItem } from './MigrationNeo3StatusAssetItem'

type TState = {
  hash: string
}

export const MigrationNeo3StatusModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrationNeo3Status' })
  const { modalErase } = useModalNavigate()
  const { hash } = useModalState<TState>()
  const dispatch = useAppDispatch()

  const { migrationNeo3 } = useMigrationNeo3Selector(hash)
  const { account: updatedNeoLegacyAccount } = useAccountSelector(migrationNeo3.neoLegacyAccount)

  const isFailure = migrationNeo3.status === 'failure'
  const icon = match(migrationNeo3.status)
    .with('failure', () => <TbCircleX className="text-pink" />)
    .with('done', () => <TbRosetteDiscountCheck className="text-blue" />)
    .otherwise(() => <TbHourglass className="text-blue p-1 animate-[wiggle_2s_ease-in-out_infinite]" />)

  const handleRevalidateMigration = () => {
    if (!isFailure) return

    dispatch(thunks.revalidateMigration({ failureMigrationNeo3: migrationNeo3 as TFailureMigrationNeo3 }))
  }

  const handleClose = () => {
    modalErase('side')
  }

  return (
    <SideModalLayout
      heading={t('title')}
      contentClassName="flex flex-col items-center overflow-auto gap-y-6"
      headingIcon={<TbArrowsExchange aria-hidden={true} />}
    >
      <div className="flex items-center justify-center w-24 h-24 p-1 bg-asphalt rounded-full">
        {cloneElement(icon, {
          ...icon.props,
          'aria-hidden': true,
          className: StyleHelper.mergeStyles('w-24 h-24 stroke-1', icon.props.className),
        })}
      </div>

      <h2 className="text-white text-xl text-center">{t(`subtitles.${migrationNeo3.status}`)}</h2>

      <Details.Root>
        <Details.Header label={t('card.title')} icon={<TbReceipt />}>
          {isFailure && (
            <div className="flex flex-row flex-grow items-center justify-end">
              <Tooltip title={t('buttons.revalidateMigration')} delayDuration={0}>
                <IconButton
                  aria-label={t('buttons.revalidateMigration')}
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
          <Details.Panel label={t('card.transaction')}>
            <Details.Item
              label={t('card.labels.destinationAddress')}
              copyable={migrationNeo3.neo3Address}
              contentClassName="justify-between"
            >
              {migrationNeo3.neo3Address}
            </Details.Item>

            <Details.Item label={t('card.labels.amountSent')} contentClassName="flex flex-col items-start gap-y-1">
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

            <Details.Item label={t('card.labels.migrationFee')} contentClassName="flex flex-col items-start gap-y-1">
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
              label={match(migrationNeo3.status)
                .with('failure', () => t('card.labels.amountWouldReceive'))
                .with('done', () => t('card.labels.amountReceived'))
                .otherwise(() => t('card.labels.amountWillReceive'))}
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

            <Details.Item label={t('card.labels.hash')} copyable={hash} contentClassName="justify-between">
              {hash}
            </Details.Item>
          </Details.Panel>
        </Details.Body>
      </Details.Root>

      {updatedNeoLegacyAccount && (
        <Link
          label={t('buttons.viewStatus')}
          className="w-full max-w-64 mx-auto"
          to={`/app/wallets/${updatedNeoLegacyAccount.id}/transactions`}
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<TbEye aria-hidden={true} />}
          onClick={handleClose}
        />
      )}
    </SideModalLayout>
  )
}
