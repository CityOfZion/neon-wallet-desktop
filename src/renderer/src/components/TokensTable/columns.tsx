import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbEye, TbEyeOff } from 'react-icons/tb'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TTokenBalance, TUseBalanceOptionShowType } from '@shared/@types/query'
import { createColumnHelper } from '@tanstack/react-table'

import { BlockchainIcon } from '../BlockchainIcon'
import { IconButton } from '../IconButton'
import { Tooltip } from '../Tooltip'

const columnHelper = createColumnHelper<TTokenBalance>()

export const useColumns = (showType: TUseBalanceOptionShowType) => {
  const { currency } = useCurrencySelector()
  const { t } = useTranslation('components', { keyPrefix: 'tokensTable' })
  const dispatch = useAppDispatch()

  return useMemo(
    () => [
      columnHelper.accessor('token.symbol', {
        cell: info => {
          return (
            <div className="flex gap-2">
              <div className="rounded-full bg-gray-300 min-w-[1.125rem] w-4.5 h-4.5 flex justify-center items-center">
                <BlockchainIcon blockchain={info.row.original.blockchain} type="white" className="w-2.5 h-2.5" />
              </div>
              <span>{info.getValue()}</span>
            </div>
          )
        },
        header: t('ticker'),
      }),
      columnHelper.accessor('token.hash', {
        cell: info => {
          const value = info.getValue()

          return (
            <Tooltip title={value}>
              <span>{StringHelper.truncateStringMiddle(value, 12)}</span>
            </Tooltip>
          )
        },
        header: t('hash'),
      }),
      columnHelper.accessor('token.name', {
        cell: info => info.getValue(),
        header: t('token'),
      }),
      columnHelper.accessor(row => NumberHelper.formatString(row.amount, { decimals: row.token.decimals }), {
        cell: info => info.getValue(),
        id: 'holdings',
        header: t('holdings'),
      }),
      columnHelper.accessor('exchangeConvertedPrice', {
        cell: info => NumberHelper.currency(info.getValue(), currency.label, { maximumFractionDigits: 8 }),
        header: t('price'),
      }),
      columnHelper.accessor('exchangeAmount', {
        cell: info => NumberHelper.currency(info.getValue(), currency.label, { maximumFractionDigits: 8 }),
        header: t('value'),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => {
          const value = info.row.original

          const service = bsAggregator.blockchainServicesByName[value.blockchain]
          const normalizedHash = UtilsHelper.normalizeHash(value.token.hash)
          const isNativeToken = service.nativeTokens.some(
            token => UtilsHelper.normalizeHash(token.hash) === normalizedHash
          )

          const isHidden = showType === 'hidden'
          const label = isHidden ? t('showTokenLabel') : t('hideTokenLabel')
          let tooltipTitle = ''

          if (!isNativeToken) tooltipTitle = label

          return (
            <div className="flex justify-end">
              <Tooltip title={tooltipTitle} delayDuration={0} contentProps={{ className: 'text-center' }}>
                <IconButton
                  aria-label={label}
                  size="sm"
                  colorSchema={isHidden ? 'neon' : 'error'}
                  icon={isHidden ? <TbEye aria-hidden /> : <TbEyeOff aria-hidden />}
                  compacted
                  disabled={isNativeToken}
                  onClick={() => {
                    if (isNativeToken) return

                    dispatch(
                      utilityReducerActions.toggleHiddenToken({
                        blockchain: info.row.original.blockchain,
                        hash: info.row.original.token.hash,
                      })
                    )
                  }}
                />
              </Tooltip>
            </div>
          )
        },
      }),
    ],
    [currency.label, dispatch, showType, t]
  )
}
