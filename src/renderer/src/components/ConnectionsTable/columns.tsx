import { useMemo } from 'react'

import { TSession } from '@cityofzion/wallet-connect-sdk-wallet-core'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DateHelper } from '@renderer/helpers/DateHelper'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import TbPlugX from '@renderer/assets/images/tb-plug-x.svg?react'

import { NEON_ICONS_URL } from '@renderer/constants/urls'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { BlockchainIcon } from '../BlockchainIcon'
import { Button } from '../Button'
import { ImageWithFallback } from '../ImageWithFallback'

const columnHelper = createColumnHelper<TSession>()

export const useColumns = (withAddress: boolean) => {
  const { t } = useTranslation('components', { keyPrefix: 'connectionsTable' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { language } = useLanguageSelector()
  const { accounts } = useAccountsSelector()
  const { modalNavigate } = useModalNavigate()

  return useMemo(() => {
    const columns: ColumnDef<TSession, any>[] = [
      columnHelper.accessor(row => row.peer.metadata, {
        header: t('name'),
        cell: info => {
          const value = info.getValue()

          return (
            <div className="flex min-w-0 items-center gap-2">
              <ImageWithFallback
                src={value.icons[0]}
                alt={value.name}
                fallbackSrc={`${NEON_ICONS_URL}/dapps/default-dapp.png`}
                imgClassName="size-5.5 rounded-full"
                className="size-7 overflow-hidden rounded-full bg-gray-600/50"
              />
              <span className="truncate">{value.name}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('approvalUnix', {
        header: t('connected'),
        cell: info => DateHelper.formatLocalized(info.getValue(), { format: 'Pp', language }),
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
            return accounts.find(SharedAccountHelper.predicate(value))?.name || value.address
          },
        })
      )
    }

    return columns
  }, [accounts, commonT, modalNavigate, t, withAddress])
}
