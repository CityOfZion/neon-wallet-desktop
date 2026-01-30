import { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { ContextMenu } from '@renderer/components/ContextMenu'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'

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
  const [isCutting, startCut] = usePressOnce(async () => {
    await ClipboardHelper.write(value)
    onChange?.('')
  })

  const [isCopying, startCopy] = usePressOnce(async () => {
    await ClipboardHelper.write(value)
  })

  const [isPasting, startPaste] = usePressOnce(async () => {
    const text = await ClipboardHelper.read()
    onChange?.(`${value}${text}`)
  })

  const hasValue = value.length > 0
  const isDisabled = disabled || readOnly

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger disabled={isDisabled}>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item disabled={isCutting || isDisabled || !hasValue} onClick={startCut} label={t('cut')} />
        <ContextMenu.Item disabled={isCopying || !hasValue} onClick={startCopy} label={t('copy')} />
        <ContextMenu.Item disabled={isPasting} onClick={startPaste} label={t('paste')} />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
