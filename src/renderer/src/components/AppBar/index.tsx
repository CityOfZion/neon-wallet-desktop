import { useEffect, useLayoutEffect, useState } from 'react'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { SharedConstantsHelper } from '@shared/helpers/SharedConstantsHelper'

import { TitleBar } from './TitleBar'

export const AppBar = () => {
  const [zoomFactor, setZoomFactor] = useState(() => window.api.sendSync('menu:getZoomFactor'))

  useEffect(() => {
    const removeListener = window.api.listen('menu:zoomFactorChanged', ({ args }) => setZoomFactor(args))

    return () => {
      removeListener()
    }
  }, [])

  useLayoutEffect(() => {
    const titleBarZoom = ConstantsHelper.isMac ? 1 / zoomFactor : 1 / Math.min(zoomFactor, 1)
    const height = SharedConstantsHelper.TITLE_BAR_HEIGHT * titleBarZoom

    const rootElement = document.querySelector('#root') as HTMLDivElement
    rootElement.style.setProperty('--title-bar-zoom', `${titleBarZoom}`)
    rootElement.style.setProperty('--drag-region-height', `${height}px`)
    rootElement.style.setProperty('--height-screen-minus-drag-region', `calc(100vh - ${height}px)`)
  }, [zoomFactor])

  if (!ConstantsHelper.isMac) return <TitleBar />

  return (
    <div className="shadow-asphalt relative z-1001 h-(--drag-region-height) max-h-(--drag-region-height) min-h-(--drag-region-height) w-screen bg-gray-800 shadow-sm [-webkit-app-region:drag]" />
  )
}
