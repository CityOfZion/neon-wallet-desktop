import { useEffect, useMemo, useRef } from 'react'

import * as RadixMenubar from '@radix-ui/react-menubar'
import { useTranslation } from 'react-i18next'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import NeonWalletCompactLogo from '@renderer/assets/images/neon-wallet-compact.svg?react'

import { SharedConstantsHelper } from '@shared/helpers/SharedConstantsHelper'
import type { TMenuCommand } from '@shared/types/api'

type TMenuItem = { command: TMenuCommand; shortcut?: string } | 'separator'

type TNativeMenu = { label: 'edit' | 'view'; items: TMenuItem[] }

const NATIVE_MENU: TNativeMenu[] = [
  {
    label: 'edit',
    items: [
      { command: 'undo', shortcut: 'Ctrl+Z' },
      { command: 'redo', shortcut: ConstantsHelper.isWindows ? 'Ctrl+Y' : 'Ctrl+Shift+Z' },
      'separator',
      { command: 'cut', shortcut: 'Ctrl+X' },
      { command: 'copy', shortcut: 'Ctrl+C' },
      { command: 'paste', shortcut: 'Ctrl+V' },
      { command: 'delete' },
      'separator',
      { command: 'selectAll', shortcut: 'Ctrl+A' },
    ],
  },
  {
    label: 'view',
    items: [
      { command: 'reload', shortcut: 'Ctrl+R' },
      { command: 'forceReload', shortcut: 'Ctrl+Shift+R' },
      { command: 'toggleDevTools', shortcut: 'F12' },
      { command: 'toggleAlwaysOnTop', shortcut: 'Ctrl+Shift+T' },
      'separator',
      { command: 'resetZoom', shortcut: 'Ctrl+0' },
      { command: 'zoomIn', shortcut: 'Ctrl+Plus' },
      { command: 'zoomOut', shortcut: 'Ctrl+Minus' },
      'separator',
      { command: 'toggleFullScreen', shortcut: 'F11' },
    ],
  },
]

export const TitleBar = () => {
  const { t } = useTranslation('components', { keyPrefix: 'appBar' })
  const lastFocusedElementRef = useRef<HTMLElement>(null)
  const pendingCommandRef = useRef<TMenuCommand>(undefined)

  const version = useMemo(() => window.api.sendSync('window:getVersion'), [])

  // Edit commands act on the focused element, so the element focused before opening the menu is tracked to restore it
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || event.target.closest('[data-app-bar-menu]')) return
      lastFocusedElementRef.current = event.target
    }

    document.addEventListener('focusin', handleFocusIn)
    return () => document.removeEventListener('focusin', handleFocusIn)
  }, [])

  const handleCloseAutoFocus = (event: Event) => {
    const command = pendingCommandRef.current

    if (!command) return

    pendingCommandRef.current = undefined
    event.preventDefault()

    const lastFocusedElement = lastFocusedElementRef.current

    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus()
    } else if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    window.api.sendAsync('menu:runCommand', command)
  }

  return (
    <div className="relative z-1001 flex h-8 w-full items-center bg-gray-800 shadow-sm [-webkit-app-region:drag] [zoom:var(--title-bar-zoom)]">
      <NeonWalletCompactLogo aria-hidden className="mr-1 ml-3 size-4 w-auto" />

      <RadixMenubar.Root data-app-bar-menu className="flex items-center gap-0.5 px-1 [-webkit-app-region:no-drag]">
        {NATIVE_MENU.map(menu => (
          <RadixMenubar.Menu key={menu.label}>
            <RadixMenubar.Trigger className="h-6 rounded-sm px-2.5 text-sm text-gray-100 outline-hidden transition-colors hover:bg-gray-300/15 hover:text-white focus-visible:bg-gray-300/15 data-[state=open]:bg-gray-300/15 data-[state=open]:text-white">
              {t(menu.label)}
            </RadixMenubar.Trigger>

            <RadixMenubar.Portal>
              <RadixMenubar.Content
                data-app-bar-menu
                align="start"
                sideOffset={8}
                className="data-[state=open]:animate-in data-[state=open]:fade-in-0 z-1010 min-w-60 rounded-sm bg-gray-900 py-0 shadow-md outline-hidden"
                onCloseAutoFocus={handleCloseAutoFocus}
              >
                {menu.items.map((item, index) =>
                  item === 'separator' ? (
                    <RadixMenubar.Separator key={`separator-${index}`} className="mx-2 my-0 h-px bg-gray-300/30" />
                  ) : (
                    <RadixMenubar.Item
                      key={`command-${item.command}`}
                      className="flex h-8 cursor-pointer items-center justify-between gap-6 rounded-sm px-3 text-sm text-gray-100 outline-hidden data-highlighted:bg-gray-800 data-highlighted:text-white"
                      onSelect={() => (pendingCommandRef.current = item.command)}
                    >
                      <span>{t(item.command)}</span>
                      {item.shortcut && <span className="text-xs text-gray-300">{item.shortcut}</span>}
                    </RadixMenubar.Item>
                  )
                )}
              </RadixMenubar.Content>
            </RadixMenubar.Portal>
          </RadixMenubar.Menu>
        ))}
      </RadixMenubar.Root>

      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center text-sm font-medium text-gray-100">
        {SharedConstantsHelper.APP_NAME} {version}
      </span>
    </div>
  )
}
