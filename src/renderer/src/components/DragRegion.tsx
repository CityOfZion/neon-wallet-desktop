import { useLayoutEffect, useState } from 'react'

import { ContextMenu } from './ContextMenu'

const IS_LINUX = window.electron.process.platform === 'linux'
const IS_MAC = window.electron.process.platform === 'darwin'
const DRAG_REGION_HEIGHT = IS_LINUX ? 0 : 32

import { useTranslation } from 'react-i18next'

import TbDeviceImacCode from '@renderer/assets/images/tb-device-imac-code.svg?react'

export const DragRegion = () => {
  const { t } = useTranslation('components', { keyPrefix: 'dragRegion' })
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

  useLayoutEffect(() => {
    const rootElement = document.querySelector('#root') as HTMLDivElement
    rootElement.style.setProperty('--drag-region-height', `${DRAG_REGION_HEIGHT}px`)
    rootElement.style.setProperty('--height-screen-minus-drag-region', `calc(100vh - ${DRAG_REGION_HEIGHT}px)`)

    if (IS_LINUX) return

    if (IS_MAC) {
      window.api.sendAsync('window:setWindowButtonPosition', { x: 12, y: 8 })
      return
    }

    window.api.sendAsync('window:setTitleBarOverlay', {
      height: DRAG_REGION_HEIGHT,
      symbolColor: '#FFFFFF',
      color: '#293139',
    })
  }, [])

  if (IS_LINUX) return null

  return (
    <ContextMenu.Root onOpenChange={setIsContextMenuOpen}>
      <ContextMenu.Trigger>
        <div
          className="shadow-asphalt relative h-[var(--drag-region-height)] min-h-[var(--drag-region-height)] w-screen bg-gray-800 shadow-sm"
          style={{
            // @ts-ignore This property is not in the types
            WebkitAppRegion: !isContextMenuOpen ? 'drag' : undefined,
          }}
        />
      </ContextMenu.Trigger>
      <ContextMenu.Content className="z-2001">
        <ContextMenu.Item
          leftIcon={<TbDeviceImacCode aria-hidden className="text-neon" />}
          label={t('toggleDevToolsMenuLabel')}
          colorSchema="white"
          iconsOnEdge={false}
          onClick={() => window.api.sendAsync('window:toggleDevTools')}
        />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
