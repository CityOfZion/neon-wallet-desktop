import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { ContextMenu } from '@renderer/components/ContextMenu'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { usePressOnce } from '@renderer/hooks/usePressOnce'

import { AppError } from '@shared/helpers/SharedErrorHelper'

type Props = {
  value: string
  disabled?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
  children: ReactNode
}

export const FieldActionsMenu = ({ value, disabled = false, readOnly = false, onChange, children }: Props) => {
  const { t } = useTranslation('components', { keyPrefix: 'fieldActionsMenu' })
  const [isCutting, startCut] = usePressOnce(async () => {
    try {
      await navigator.clipboard.writeText(value)
      onChange?.('')
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('messages.error')).displayMessage })
    }
  })

  const [isCopying, startCopy] = usePressOnce(async () => {
    try {
      await navigator.clipboard.writeText(value)

      ToastHelper.success({ message: t('messages.copied') })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('messages.error')).displayMessage })
    }
  })

  const [isPasting, startPaste] = usePressOnce(async () => {
    try {
      const text = await navigator.clipboard.readText()

      onChange?.(`${value}${text}`)
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: AppError.wrap(error, t('messages.error')).displayMessage })
    }
  })

  const hasValue = value.length > 0
  const isDisabled = disabled || readOnly

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isDisabled}>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item disabled={isCutting || isDisabled || !hasValue} onClick={startCut}>
          {t('cut')}
        </ContextMenu.Item>

        <ContextMenu.Item disabled={isCopying || !hasValue} onClick={startCopy}>
          {t('copy')}
        </ContextMenu.Item>

        <ContextMenu.Item disabled={isPasting} onClick={startPaste}>
          {t('paste')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
