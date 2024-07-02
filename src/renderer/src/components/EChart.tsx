import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts'
import { init } from 'echarts'

export interface ReactEChartsProps {
  option: EChartsOption
  style?: CSSProperties
  settings?: SetOptionOpts
}

export function EChart({ option, style, settings }: ReactEChartsProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ECharts>()

  useEffect(() => {
    if (containerRef.current !== null) {
      chartRef.current = init(containerRef.current)
      chartRef.current?.setOption(option, settings)
    }

    function resizeChart() {
      chartRef.current?.resize()
    }

    window.addEventListener('resize', resizeChart)

    return () => {
      chartRef.current?.dispose()
      window.removeEventListener('resize', resizeChart)
    }
  }, [])

  useEffect(() => {
    if (containerRef.current !== null) {
      chartRef.current?.setOption(option, settings)
    }
  }, [option, settings])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }} />
}
