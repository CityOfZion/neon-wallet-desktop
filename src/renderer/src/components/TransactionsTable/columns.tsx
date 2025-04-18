import { useMemo } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { getI18next } from '@shared/libs/i18next'
import { createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'

import { BlockchainIcon } from '../BlockchainIcon'
import { Button } from '../Button'

import { Actions } from './Actions'

const { t } = getI18next()

const columnHelper = createColumnHelper<TUseTransactionsTransfer>()

export const useColumns = (showSimplified: boolean) => {
  return useMemo(
    () => [
      ...(!showSimplified
        ? [
            columnHelper.accessor(row => row.account.blockchain, {
              cell: info => <BlockchainIcon blockchain={info.getValue()} />,
              id: 'blockchain',
              header: undefined,
            }),
          ]
        : []),
      columnHelper.accessor('time', {
        cell: info => format((info.getValue() ?? DateHelper.getNowUnix()) * 1000, 'MM/dd/yyyy HH:mm:ss'),
        header: t('components:transactionsTable.date'),
      }),
      columnHelper.accessor('asset', {
        cell: info => info.getValue(),
        header: t('components:transactionsTable.asset'),
      }),
      columnHelper.accessor('amount', {
        cell: info => info.getValue(),
        header: t('components:transactionsTable.amount'),
      }),
      ...(!showSimplified
        ? [
            columnHelper.accessor(row => row.fromAccount?.name ?? row.from, {
              cell: info => StringHelper.truncateStringMiddle(info.getValue(), 15),
              id: 'from',
              header: t('components:transactionsTable.from'),
            }),
          ]
        : []),
      columnHelper.accessor(row => row.toAccount?.name ?? row.to, {
        cell: info => (
          <Button
            className="flex flex-row"
            label={StringHelper.truncateStringMiddle(info.getValue(), 25)}
            rightIcon={<MdContentCopy aria-hidden className="text-neon w-4.5 h-4.5" />}
            variant="text-slim"
            colorSchema="white"
            clickableProps={{ className: 'text-xs' }}
            onClick={event => {
              event.stopPropagation()
              UtilsHelper.copyToClipboard(info.row.original.to ?? '')
            }}
          />
        ),
        id: 'to',
        header: t('components:transactionsTable.to'),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => <Actions transfer={info.row.original} />,
      }),
    ],
    [showSimplified]
  )
}
