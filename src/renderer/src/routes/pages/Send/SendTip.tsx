import { type KeyboardEvent, useEffect } from 'react'

import { BSBigHumanAmount, BSBigNumber, type TBSToken } from '@cityofzion/blockchain-service'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { IconButton } from '@renderer/components/IconButton'
import { Skeleton } from '@renderer/components/Skeleton'
import { Tooltip } from '@renderer/components/Tooltip'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CurrencyHelper } from '@renderer/helpers/CurrencyHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import TbDeviceFloppy from '@renderer/assets/images/tb-device-floppy.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'

type TProps = {
  className?: string
  amountBn: BSBigNumber
  fiatPriceBn: BSBigNumber
  customAmountBn?: BSBigNumber
  token: TBSToken
  isChecked: boolean
  isDisabled: boolean
  isLoading: boolean
  onChange(isChecked: boolean): void
  onCustomAmountChange(customAmount?: string): void
}

type TActionsData = {
  isEditing: boolean
  isDebouncing: boolean
  customAmount: string
}

export const SendTip = ({
  className,
  amountBn,
  fiatPriceBn,
  customAmountBn,
  token,
  isChecked,
  isDisabled,
  isLoading,
  onChange,
  onCustomAmountChange,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendTip' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { currency } = useCurrencySelector()
  const debounce = useDebounceFunction()

  const { actionData, setData, handleAct } = useActions<TActionsData>({
    isEditing: false,
    isDebouncing: false,
    customAmount: '',
  })

  const isInternalDisabled = (isDisabled || isLoading) && !isChecked

  const handleEdit = () => {
    setData({ customAmount: customAmountBn ? customAmountBn.toFixed() : '', isEditing: true, isDebouncing: false })
  }

  const handleChangeAmount = (customAmount: string) => {
    customAmount = customAmount.trim()

    const isDebouncing = !!customAmount

    setData({ isDebouncing, customAmount })

    debounce(() => {
      if (!isDebouncing) return

      setData({ isDebouncing: false, customAmount: new BSBigHumanAmount(customAmount, token.decimals).toFormatted() })
    })
  }

  const handleSave = () => {
    setData({ isEditing: false })

    const formattedAmount = actionData.customAmount
      ? new BSBigHumanAmount(actionData.customAmount, token.decimals).toFormatted()
      : undefined

    onCustomAmountChange(formattedAmount)
  }

  const handleKeyDown = ({ key }: KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Escape') setData({ isEditing: false, isDebouncing: false })
  }

  const handleReset = () => {
    setData({ isEditing: false, isDebouncing: false, customAmount: '' })

    onCustomAmountChange(undefined)
  }

  useEffect(() => {
    setData({ isEditing: false })
  }, [isChecked, setData])

  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex w-full flex-col rounded bg-green-700/50 px-3 py-4 text-xs font-medium',
        className
      )}
    >
      <div className="flex w-full items-start gap-x-8">
        <label
          aria-disabled={isInternalDisabled}
          className="text-neon flex grow cursor-pointer items-start gap-x-2 select-none aria-disabled:cursor-not-allowed"
        >
          <Checkbox
            className="mt-0.5"
            checked={isChecked}
            disabled={isInternalDisabled}
            onCheckedChange={() => onChange(!isChecked)}
          />

          <div className="flex w-full flex-col gap-y-1">
            <span className="block">
              {`${
                customAmountBn
                  ? t('supportCustomAmountLabel')
                  : t('supportLabel', {
                      percentage: ConstantsHelper.tipPercentageBn.multipliedBy(100).toNumber(),
                    })
              } `}
              {isLoading ? (
                <Skeleton className="inline-block h-4 max-h-4 min-h-4 w-28 max-w-28 min-w-28 bg-gray-300 align-bottom" />
              ) : (
                <span className="uppercase">
                  {`${new BSBigHumanAmount(amountBn.toFixed(), token.decimals).toFormatted()} ${token.symbol} (${CurrencyHelper.format(fiatPriceBn.toFixed(), { currency, maximumFractionDigits: 2 })} ${currency.label})`}
                </span>
              )}
            </span>
            <span className="block text-gray-100 italic">{t('optionalLabel')}</span>
          </div>
        </label>

        {actionData.isEditing ? (
          <Button label={tCommonGeneral('reset')} flat variant="text-slim" onClick={handleReset} />
        ) : (
          <Tooltip title={isInternalDisabled ? '' : tCommonGeneral('edit')}>
            <IconButton
              aria-label={tCommonGeneral('edit')}
              size="sm"
              compacted
              icon={<TbPencil aria-hidden className="text-neon" />}
              disabled={isInternalDisabled}
              onClick={handleEdit}
            />
          </Tooltip>
        )}
      </div>

      <AnimatePresence>
        {actionData.isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAct(handleSave)} className="mt-3 flex items-center gap-x-2">
              <GreyAmountInput
                autoFocus
                aria-label={t('customAmountLabel')}
                placeholder={t('customAmountLabel')}
                containerClassName="w-full"
                contentClassName="h-8.5 pr-4 pl-4 text-xs bg-asphalt"
                value={actionData.customAmount}
                maxLength={18}
                loading={actionData.isDebouncing}
                disabled={isInternalDisabled}
                rightElement={<span className="text-xs text-gray-100">{token.symbol}</span>}
                onKeyDown={handleKeyDown}
                onChangeValue={handleChangeAmount}
              />

              <Tooltip title={actionData.isDebouncing ? '' : tCommonGeneral('save')}>
                <IconButton
                  type="submit"
                  aria-label={tCommonGeneral('save')}
                  size="sm"
                  compacted
                  disabled={actionData.isDebouncing}
                  icon={<TbDeviceFloppy aria-hidden className="text-neon" />}
                />
              </Tooltip>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
