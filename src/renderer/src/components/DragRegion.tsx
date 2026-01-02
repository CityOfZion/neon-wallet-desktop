import { useLayoutEffect } from 'react'

const IS_LINUX = window.electron.process.platform === 'linux'
const IS_MAC = window.electron.process.platform === 'darwin'
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
      className="shadow-asphalt relative z-2000 h-[var(--drag-region-height)] min-h-[var(--drag-region-height)] w-screen bg-gray-800 shadow-sm"
      style={{
        // @ts-ignore This property is not in the types
        WebkitAppRegion: 'drag',
      }}
    />
  )
}
