import { useLayoutEffect } from 'react'
import { IS_LINUX, IS_MAC } from '@renderer/constants/platform'

const DRAG_REGION_HEIGHT = IS_LINUX ? 0 : 32

export const DragRegion = () => {
  useLayoutEffect(() => {
    const rootElement = document.querySelector('#root') as HTMLDivElement
    rootElement.style.setProperty('--drag-region-height', `${DRAG_REGION_HEIGHT}px`)
    rootElement.style.setProperty('--height-screen-minus-drag-region', `calc(100vh - ${DRAG_REGION_HEIGHT}px)`)

    if (IS_LINUX) return

    if (IS_MAC) {
      window.api.sendAsync('setWindowButtonPosition', { x: 12, y: 8 })
      return
    }

    window.api.sendAsync('setTitleBarOverlay', { height: DRAG_REGION_HEIGHT, symbolColor: '#FFFFFF', color: '#293139' })
  }, [])

  if (IS_LINUX) return null

  return (
    <div
      className="h-drag-region min-h-drag-region w-screen relative z-[2000] bg-gray-800 shadow shadow-asphalt"
      style={{
        // @ts-ignore This property is not in the types
        WebkitAppRegion: 'drag',
      }}
    />
  )
}
