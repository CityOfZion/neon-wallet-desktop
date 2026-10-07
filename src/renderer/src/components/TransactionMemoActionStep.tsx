import { useEffect, useRef, useState } from 'react'

import { IBSWithMemo } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'

import TbNotes from '@renderer/assets/images/tb-notes.svg?react'

export type TTransactionMemo = {
  value?: string
  // False while the typed memo is being debounced or is invalid
  isReady: boolean
}

type TProps = {
  className?: string
  service: IBSWithMemo
  memo?: TTransactionMemo
  disabled?: boolean
  errorMessage?: string
  onChange(memo: TTransactionMemo): void
}

export const TransactionMemoActionStep = ({ className, service, memo, disabled, errorMessage, onChange }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionMemoActionStep' })
  const debounce = useDebounceFunction()

  const [value, setValue] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)

  // Latest typed value, null once unmounted, so pending debounced callbacks can detect they are stale
  const latestValueRef = useRef<string | null>('')

  const handleChange = (newValue: string) => {
    const value = newValue.trim() || undefined
    const isValid = !value || service.validateMemo(value)

    latestValueRef.current = newValue
    setValue(newValue)
    setIsInvalid(!isValid)
    onChange({ value: memo?.value, isReady: false })

    if (!isValid) return

    debounce(() => {
      if (latestValueRef.current !== newValue) return

      onChange({ value, isReady: true })
    })
  }

  // The page clears the memo on account change or after sending
  useEffect(() => {
    if (memo) return

    latestValueRef.current = ''
    setValue('')
    setIsInvalid(false)
  }, [memo])

  useEffect(() => {
    return () => {
      latestValueRef.current = null
    }
  }, [])

  return (
    <div className={StyleHelper.mergeStyles('flex w-full flex-col rounded-sm bg-gray-700/60 px-3.5', className)}>
      <ActionStep className="px-0" title={t('title')} leftIcon={<TbNotes aria-hidden />}>
        <span className="text-xs text-gray-100 italic">{t('optionalLabel')}</span>
      </ActionStep>

      <Separator />

      <div className="my-5 flex w-full flex-col">
        <Input
          value={value}
          placeholder={t('placeholder')}
          className="w-full"
          errorMessage={isInvalid ? t('invalidMemo') : errorMessage}
          compacted
          pastable
          disabled={disabled}
          onChangeValue={handleChange}
        />
      </div>
    </div>
  )
}
