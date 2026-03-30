import { useLayoutEffect } from 'react'

const IS_MAC = window.electron.process.platform === 'darwin'
const DRAG_REGION_HEIGHT = IS_MAC ? 32 : 0

export const AppBar = () => {
  useLayoutEffect(() => {
    const rootElement = document.querySelector('#root') as HTMLDivElement
    rootElement.style.setProperty('--drag-region-height', `${DRAG_REGION_HEIGHT}px`)
    rootElement.style.setProperty('--height-screen-minus-drag-region', `calc(100vh - ${DRAG_REGION_HEIGHT}px)`)
  }, [])

  if (!IS_MAC) return null

  return (
    <div
      className="shadow-asphalt relative z-1001 h-[var(--drag-region-height)] min-h-[var(--drag-region-height)] w-screen bg-gray-800 shadow-sm"
      style={{
        // @ts-ignore This property is not in the types
        WebkitAppRegion: 'drag',
      }}
    />
  )
}
