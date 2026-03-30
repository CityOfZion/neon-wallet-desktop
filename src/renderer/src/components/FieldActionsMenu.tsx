import { ReactNode } from 'react'

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { useTranslation } from 'react-i18next'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'

import { usePressOnce } from '@renderer/hooks/usePressOnce'

import { Button } from './Button'

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

  const items = [
    {
      id: 'cut',
      label: t('cut'),
      onClick: startCut,
      disabled: isCutting || isDisabled || !hasValue,
    },
    {
      id: 'copy',
      label: t('copy'),
      onClick: startCopy,
      disabled: isCopying || !hasValue,
    },
    {
      id: 'paste',
      label: t('paste'),
      onClick: startPaste,
      disabled: isPasting,
    },
  ]

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger disabled={isDisabled} className="flex w-full">
        {children}
      </ContextMenuPrimitive.Trigger>

      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content className="border-neon data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-2012 flex min-w-20 flex-col overflow-hidden rounded-sm border-t-3 bg-gray-900/50 shadow-md backdrop-blur-md">
          {items.map(item => (
            <ContextMenuPrimitive.Item asChild key={item.id}>
              <Button
                variant="text"
                flat
                colorSchema="white"
                clickableProps={{ className: 'rounded-none h-10 px-4 justify-start gap-3' }}
                disabled={item.disabled}
                onClick={item.onClick}
                label={item.label}
              />
            </ContextMenuPrimitive.Item>
          ))}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}
