import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbEye, TbEyeOff } from 'react-icons/tb'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
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
        cell: info => NumberHelper.currency(info.getValue(), currency.label),
        header: t('price'),
      }),
      columnHelper.accessor('exchangeAmount', {
        cell: info => NumberHelper.currency(info.getValue(), currency.label),
        header: t('value'),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => {
          const isHidden = showType === 'hidden'
          return (
            <div className="flex justify-end">
              <IconButton
                aria-label={isHidden ? t('showTokenLabel') : t('hideTokenLabel')}
                size="sm"
                colorSchema={isHidden ? 'neon' : 'error'}
                icon={isHidden ? <TbEye aria-hidden /> : <TbEyeOff aria-hidden />}
                compacted
                onClick={() =>
                  dispatch(
                    utilityReducerActions.toggleHiddenToken({
                      blockchain: info.row.original.blockchain,
                      hash: info.row.original.token.hash,
                    })
                  )
                }
              />
            </div>
          )
        },
      }),
    ],
    [currency.label, dispatch, showType, t]
  )
}
