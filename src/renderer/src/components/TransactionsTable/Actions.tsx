import { useTranslation } from 'react-i18next'
import { TbArrowsExchange, TbChevronRight, TbTransform } from 'react-icons/tb'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useMigrationNeo3Selector, useSwapRecordsSelector } from '@renderer/hooks/useUtilitySelector'
import { thunks } from '@renderer/store/thunks'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { Button } from '../Button'

type TProps = {
  transfer: TUseTransactionsTransfer
}

export const Actions = ({ transfer }: TProps) => {
  const { t: commonT } = useTranslation('common')
  const { swapRecords } = useSwapRecordsSelector()
  const { migrationNeo3 } = useMigrationNeo3Selector(transfer.hash)
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()

  const normalizeHash = UtilsHelper.normalizeHash(transfer.hash)
  const swapRecord = swapRecords.find(
    swapRecord => !!swapRecord.txFrom && UtilsHelper.normalizeHash(swapRecord.txFrom) === normalizeHash
  )

  const handleMigrationClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await SharedUtilsHelper.sleep(100)
    modalNavigate('migration-neo3-status', { state: { hash: transfer.hash } })
  }

  const handleSwapClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    modalNavigate('swap-details', { state: { swapRecord } })
  }

  // TODO: Remove this when we resolve this issue https://app.clickup.com/t/86a82109t
  useMountUnsafe(() => {
    if (migrationNeo3 && migrationNeo3.status === 'pending') {
      dispatch(thunks.waitMigration({ ...migrationNeo3, status: 'failure-neo3' }))
    }
  })

  return (
    <div className="flex gap-5 justify-end">
      {migrationNeo3 && (
        <Button
          label={commonT('general.migrationNeo3')}
          variant="text-slim"
          colorSchema="yellow"
          leftIcon={<TbArrowsExchange aria-hidden={true} />}
          onClick={handleMigrationClick}
        />
      )}

      {swapRecord && (
        <Button
          variant="text-slim"
          label={commonT('general.swap')}
          colorSchema="blue"
          leftIcon={<TbTransform aria-hidden={true} />}
          onClick={handleSwapClick}
        />
      )}

      <TbChevronRight
        aria-hidden
        style={{ visibility: transfer.explorerUrl ? 'visible' : 'hidden' }}
        className="w-4 h-4 my-2 text-gray-300"
      />
    </div>
  )
}
