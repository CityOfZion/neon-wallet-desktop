import { useEffect } from 'react'

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
  onCustomAmountChange: (customAmount?: string) => void
}

type TActionsData = {
  isEditing: boolean
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

  const { actionData, setData, handleAct } = useActions<TActionsData>({ isEditing: false, customAmount: '' })

  const isInternalDisabled = isDisabled || isLoading
  const isToggleDisabled = isInternalDisabled && !isChecked

  const handleEdit = () => {
    setData({ customAmount: customAmountBn ? customAmountBn.toFixed() : '', isEditing: true })
  }

  const handleChangeAmount = (value: string) => {
    setData({ customAmount: value })
  }

  const handleSave = () => {
    setData({ isEditing: false })

    const formattedAmount = actionData.customAmount
      ? new BSBigHumanAmount(actionData.customAmount, token.decimals).toFormatted()
      : undefined

    onCustomAmountChange(formattedAmount)
  }

  const handleReset = () => {
    setData({ isEditing: false, customAmount: '' })

    onCustomAmountChange(undefined)
  }

  useEffect(() => {
    if (isChecked) {
      return
    }

    setData({ isEditing: false, customAmount: '' })
  }, [isChecked, setData])

  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex w-full flex-col rounded bg-green-700/50 px-3 py-4 text-xs font-medium',
        className
      )}
    >
      <div className="flex w-full items-center gap-x-3">
        <label
          aria-disabled={isToggleDisabled}
          className="text-neon flex grow cursor-pointer items-center gap-x-3 select-none aria-disabled:cursor-not-allowed"
        >
          <Checkbox checked={isChecked} disabled={isToggleDisabled} onCheckedChange={() => onChange(!isChecked)} />

          <div className="flex w-full flex-col gap-y-1">
            <p>
              {customAmountBn
                ? t('supportCustomLabel')
                : t('supportLabel', {
                    percentage: ConstantsHelper.tipPercentageBn.multipliedBy(100).toNumber(),
                  })}{' '}
              {isLoading ? (
                <Skeleton className="inline-block h-4 max-h-4 min-h-4 w-24 max-w-24 min-w-24 bg-gray-100 align-bottom" />
              ) : (
                <span className="uppercase">
                  {new BSBigHumanAmount(amountBn.toFixed(), token.decimals).toFormatted()} {token.symbol} (
                  {CurrencyHelper.format(fiatPriceBn.toFixed(), { currency, maximumFractionDigits: 2 })}{' '}
                  {currency.label})
                </span>
              )}
            </p>
            <span className="block text-gray-100 italic">{t('optionalLabel')}</span>
          </div>
        </label>

        {actionData.isEditing ? (
          <Button label={tCommonGeneral('reset')} flat variant="text-slim" onClick={handleReset} />
        ) : (
          <Tooltip title={tCommonGeneral('edit')}>
            <IconButton
              aria-label={tCommonGeneral('edit')}
              size="sm"
              compacted
              icon={<TbPencil aria-hidden className="text-neon" />}
              disabled={!isChecked}
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
            <form onSubmit={handleAct(handleSave)} className="mt-3 flex items-center gap-x-1.5">
              <GreyAmountInput
                autoFocus
                value={actionData.customAmount}
                onChangeValue={handleChangeAmount}
                disabled={isToggleDisabled}
                aria-label={t('customAmountLabel')}
                placeholder={t('customAmountLabel')}
                containerClassName="w-full"
                contentClassName="h-8.5 pr-4 pl-4 text-xs bg-asphalt"
                rightElement={<span className="text-xs text-gray-100 uppercase">{token.symbol}</span>}
              />

              <Tooltip title={tCommonGeneral('save')}>
                <IconButton
                  type="submit"
                  aria-label={tCommonGeneral('save')}
                  size="sm"
                  compacted
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
