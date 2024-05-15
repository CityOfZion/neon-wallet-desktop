import { useLayoutEffect } from 'react'

const DRAG_REGION_HEIGHT = 32

export const DragRegion = () => {
  useLayoutEffect(() => {
    const rootElement = document.querySelector('#root') as HTMLDivElement
    rootElement.style.setProperty('--drag-region-height', `${DRAG_REGION_HEIGHT}px`)
    rootElement.style.setProperty('--height-screen-minus-drag-region', `calc(100vh - ${DRAG_REGION_HEIGHT}px)`)

    if (window.electron.process.platform === 'darwin') {
      window.api.setWindowButtonPosition({ x: 12, y: 8 })
      return
    }

    window.api.setTitleBarOverlay({ height: DRAG_REGION_HEIGHT, symbolColor: '#FFFFFF', color: '#293139' })
  }, [])

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
