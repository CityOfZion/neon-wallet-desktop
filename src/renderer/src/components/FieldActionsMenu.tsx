import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { ContextMenu } from '@renderer/components/ContextMenu'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { usePressOnce } from '@renderer/hooks/usePressOnce'

type Props = {
  value: string
  disabled?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
  children: ReactNode
}

export const FieldActionsMenu = ({ value, disabled = false, readOnly = false, onChange, children }: Props) => {
  const { t } = useTranslation('components', { keyPrefix: 'fieldActionsMenu' })
  const pressOnceCut = usePressOnce()
  const pressOnceCopy = usePressOnce()
  const pressOncePaste = usePressOnce()
  const hasValue = value.length > 0
  const isDisabled = disabled || readOnly

  const handleCut = async () => {
    try {
      await navigator.clipboard.writeText(value)

      onChange?.('')
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('messages.error') })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)

      ToastHelper.success({ message: t('messages.copied') })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('messages.error') })
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()

      onChange?.(`${value}${text}`)
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('messages.error') })
    }
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isDisabled}>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          disabled={pressOnceCut.isPressing || isDisabled || !hasValue}
          onClick={pressOnceCut.handlePressOnce(handleCut)}
        >
          {t('cut')}
        </ContextMenu.Item>
        <ContextMenu.Item
          disabled={pressOnceCopy.isPressing || !hasValue}
          onClick={pressOnceCopy.handlePressOnce(handleCopy)}
        >
          {t('copy')}
        </ContextMenu.Item>
        <ContextMenu.Item
          disabled={pressOncePaste.isPressing || isDisabled}
          onClick={pressOncePaste.handlePressOnce(handlePaste)}
        >
          {t('paste')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
