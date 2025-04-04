import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { MdRefresh } from 'react-icons/md'
import { TbArrowsExchange, TbCircleX, TbEye, TbHourglass, TbReceipt, TbRosetteDiscountCheck } from 'react-icons/tb'
import { Details } from '@renderer/components/Details'
import { IconButton } from '@renderer/components/IconButton'
import { Link } from '@renderer/components/Link'
import { Tooltip } from '@renderer/components/Tooltip'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
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
  const { accounts } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const migrationNeo3Selector = useMigrationNeo3Selector(hash)

  const migrationNeo3 = migrationNeo3Selector.migrationNeo3!

  const isFailure = migrationNeo3.status === 'failure'

  const account = accounts.find(AccountHelper.predicate(migrationNeo3.account))

  const hasGas = !!migrationNeo3.gasToken
  const hasNeo = !!migrationNeo3.neoToken

  const { blockchain } = migrationNeo3.account

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
              {hasGas && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.gasSent!}
                  token={migrationNeo3.gasToken!}
                  blockchain={blockchain}
                />
              )}

              {hasNeo && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neoSent!}
                  token={migrationNeo3.neoToken!}
                  blockchain={blockchain}
                />
              )}
            </Details.Item>

            <Details.Item label={t('card.labels.migrationFee')} contentClassName="flex flex-col items-start gap-y-1">
              {hasGas && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3GasFee!}
                  token={migrationNeo3.neo3GasToken}
                  blockchain="neo3"
                />
              )}

              {hasNeo && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3NeoFee!}
                  token={migrationNeo3.neo3NeoToken}
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
              {hasGas && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3GasAmount!}
                  token={migrationNeo3.neo3GasToken}
                  blockchain="neo3"
                />
              )}

              {hasNeo && (
                <MigrationNeo3StatusAssetItem
                  amount={migrationNeo3.neo3NeoAmount!}
                  token={migrationNeo3.neo3NeoToken}
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

      {account && (
        <Link
          label={t('buttons.viewStatus')}
          className="w-full max-w-64 mx-auto"
          to={`/app/wallets/${account.id}/transactions`}
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
