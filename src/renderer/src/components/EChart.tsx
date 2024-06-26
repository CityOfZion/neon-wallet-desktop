import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts'
import { getInstanceByDom, init } from 'echarts'

export interface ReactEChartsProps {
  option: EChartsOption
  style?: CSSProperties
  settings?: SetOptionOpts
}

export function EChart({ option, style, settings }: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let chart: ECharts | undefined
    if (chartRef.current !== null) {
      chart = init(chartRef.current)
    }

    function resizeChart() {
      chart?.resize()
    }
    window.addEventListener('resize', resizeChart)

    return () => {
      chart?.dispose()
      window.removeEventListener('resize', resizeChart)
    }
  }, [])

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current)
      chart?.setOption(option, settings)
    }
  }, [option, settings])

  return <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />
}
