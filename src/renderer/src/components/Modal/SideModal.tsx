import { useLayoutEffect, useMemo, useState } from 'react'
import { THistory, TRouterSize } from '@renderer/@types/modal'
import { ModalRouterCurrentHistoryProvider } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import { useModalHistories } from '@renderer/hooks/useModalRouter'
import { motion, useAnimate, usePresence } from 'framer-motion'

import { ModalContainer } from './ModalContainer'

const widthBySizes: Partial<Record<TRouterSize, string>> = {
  md: '25.875rem',
  sm: '20.625rem',
  xl: '62.5rem',
  lg: '45rem',
}

export const SideModal = () => {
  const { histories } = useModalHistories()
  const [isPresent, safeToRemove] = usePresence()
  const [scope, animate] = useAnimate()

  const [lastSideHistory, setLastSideHistory] = useState<THistory>()

  const width = useMemo(() => {
    if (!lastSideHistory) return
    const widthBySize = widthBySizes[lastSideHistory.route.size ?? 'sm']
    if (!widthBySize) throw new Error('Invalid size')

    return widthBySize
  }, [lastSideHistory])

  useLayoutEffect(() => {
    if (!isPresent) {
      return
    }

    setLastSideHistory(histories.filter(history => history.route.type === 'side').pop())
  }, [histories, isPresent])

  useLayoutEffect(() => {
    if (!width) return

    if (isPresent) {
      animate(scope.current, { width }, { type: 'spring', duration: 0.2 })
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { width: 0 }, { duration: 0.1 })
        safeToRemove()
      }

      exitAnimation()
    }
  }, [width, isPresent, animate, scope, safeToRemove])

  return (
    <ModalContainer className="flex justify-end">
      <motion.div className="h-full relative" ref={scope} initial={{ width: 0 }}>
        {lastSideHistory && width && (
          <ModalRouterCurrentHistoryProvider value={lastSideHistory} key={lastSideHistory.id}>
            <div className={`min-w-[${width}] h-full`}>{lastSideHistory.route.element}</div>
          </ModalRouterCurrentHistoryProvider>
        )}
      </motion.div>
    </ModalContainer>
  )
}
