import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPlugX } from 'react-icons/tb'
import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-core'
import dappFallbackIcon from '@renderer/assets/images/dapp-fallback-icon.png'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import { BlockchainIcon } from '../BlockchainIcon'
import { Button } from '../Button'
import { ImageWithFallback } from '../ImageWithFallback'

const columnHelper = createColumnHelper<TSession>()

export const useColumns = (withAddress: boolean) => {
  const { t } = useTranslation('components', { keyPrefix: 'connectionsTable' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { accounts } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()

  return useMemo(() => {
    const columns: ColumnDef<TSession, any>[] = [
      columnHelper.accessor(row => row.peer.metadata, {
        header: t('name'),
        cell: info => {
          const value = info.getValue()

          return (
            <div className="flex gap-2 min-w-0 items-center">
              <ImageWithFallback
                src={value.icons[0]}
                alt={value.name}
                fallbackSrc={dappFallbackIcon}
                className="h-5 w-5 min-w-[1.25rem] object-contain rounded-full bg-gray-300/30 overflow-hidden"
              />
              <span className="truncate">{value.name}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('approvalUnix', {
        header: t('connected'),
        cell: info => DateHelper.unixToDateHour(info.getValue()),
      }),
      columnHelper.accessor(row => WalletConnectHelper.getAccountInformationFromSession(row).blockchain, {
        header: t('chain'),
        cell: info => {
          const value = info.getValue()

          return (
            <div className="flex">
              <BlockchainIcon blockchain={value} />
              <span className="ml-2">{commonT(value)}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor(row => row, {
        id: 'actions',
        header: undefined,
        meta: { className: 'w-28' },
        cell: info => (
          <Button
            leftIcon={<TbPlugX aria-hidden />}
            flat
            variant="text-slim"
            colorSchema="error"
            onClick={() => modalNavigate('dapp-disconnection', { state: { sessions: [info.getValue()] } })}
            label={t('disconnect')}
          />
        ),
      }),
    ]

    if (withAddress) {
      columns.splice(
        3,
        0,
        columnHelper.accessor(row => WalletConnectHelper.getAccountInformationFromSession(row), {
          header: t('account'),
          cell: info => {
            const value = info.getValue()
            return accounts.find(AccountHelper.predicate(value))?.name ?? value.address
          },
        })
      )
    }

    return columns
  }, [accounts, commonT, modalNavigate, t, withAddress])
}
