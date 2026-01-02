import { useMemo } from 'react'

import { BSBigNumberHelper } from '@cityofzion/blockchain-service'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { ImageWithFallback } from '@renderer/components/ImageWithFallback'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TokenHelper } from '@renderer/helpers/TokenHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import TbEye from '@renderer/assets/images/tb-eye.svg?react'
import TbEyeOff from '@renderer/assets/images/tb-eye-off.svg?react'

import { utilityReducerActions } from '@renderer/store/reducers/utility'
import { TTokenBalance, TUseBalanceOptionShowType } from '@shared/types/query'

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
          const tokenBalance = info.row.original
          const { token } = tokenBalance

          return (
            <div className="flex items-center gap-2">
              <ImageWithFallback
                src={`${ConstantsHelper.neonIconsUrl}/tokens/${tokenBalance.blockchain}/${token.hash}.png`}
                alt={token.name || token.symbol}
                fallbackSrc={`${ConstantsHelper.neonIconsUrl}/tokens/default-token.png`}
                imgClassName="h-4.5 max-h-4.5 min-h-4.5 w-4.5 max-w-4.5 min-w-4.5 rounded-full"
                className="h-6 max-h-6 min-h-6 w-6 max-w-6 min-w-6 rounded-full bg-gray-600/50"
              />

              {info.getValue()}
            </div>
          )
        },
        header: t('ticker'),
      }),
      columnHelper.accessor('token.hash', {
        cell: info => {
          const hash = info.getValue()
          const isValidHash = TokenHelper.isValidTokenHash(hash)
          const hashText = TokenHelper.fallbackTokenHash(hash)

          return (
            <Tooltip title={isValidHash ? hash : ''}>
              <span>{isValidHash ? StringHelper.truncateStringMiddle(hashText, 12) : hashText}</span>
            </Tooltip>
          )
        },
        header: t('hash'),
      }),
      columnHelper.accessor('token.name', {
        cell: info => info.getValue(),
        header: t('token'),
      }),
      columnHelper.accessor(row => BSBigNumberHelper.format(row.amount, { decimals: row.token.decimals }), {
        cell: info => info.getValue(),
        id: 'holdings',
        header: t('holdings'),
      }),
      columnHelper.accessor('exchangeConvertedPrice', {
        cell: info => CurrencyHelper.format(info.getValue(), { currency, maximumFractionDigits: 8 }),
        header: t('price'),
      }),
      columnHelper.accessor('exchangeAmount', {
        cell: info => CurrencyHelper.format(info.getValue(), { currency, maximumFractionDigits: 8 }),
        header: t('value'),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => {
          const value = info.row.original
          const isNativeToken = TokenHelper.isNativeToken(value.token.hash, value.blockchain)
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
                      utilityReducerActions.toggleHiddenToken({ hash: value.token.hash, blockchain: value.blockchain })
                    )
                  }}
                />
              </Tooltip>
            </div>
          )
        },
      }),
    ],
    [currency, dispatch, showType, t]
  )
}
