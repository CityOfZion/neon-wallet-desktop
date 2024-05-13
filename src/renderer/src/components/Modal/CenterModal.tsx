import { useLayoutEffect, useMemo, useState } from 'react'
import { THistory, TRouterSize } from '@renderer/@types/modal'
import { ModalRouterCurrentHistoryProvider } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import { useModalHistories } from '@renderer/hooks/useModalRouter'
import { motion, useAnimate, usePresence } from 'framer-motion'

import { ModalContainer } from './ModalContainer'

const widthBySizes: Partial<Record<TRouterSize, string>> = {
  sm: '32rem',
  lg: '53rem',
}

export const CenterModal = () => {
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

    const centerHistories = histories.filter(history => history.route.type === 'center')

    setLastSideHistory(centerHistories.pop())
  }, [histories, isPresent])

  useLayoutEffect(() => {
    if (!width) return

    if (isPresent) {
      animate(scope.current, { scale: 1, opacity: 1, width }, { type: 'spring', duration: 0.1 })
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scale: 0.95, opacity: 0 }, { duration: 0.1 })
        safeToRemove()
      }

      exitAnimation()
    }
  }, [width, isPresent, animate, scope, safeToRemove])

  return (
    <ModalContainer className="flex justify-center items-center">
      <motion.div className="relative h-[38.75rem]" ref={scope} initial={{ scale: 0.95, opacity: 0 }}>
        {lastSideHistory && (
          <ModalRouterCurrentHistoryProvider value={lastSideHistory} key={lastSideHistory.id}>
            <div className={`min-w-[${width}] h-full`}>{lastSideHistory.route.element}</div>
          </ModalRouterCurrentHistoryProvider>
        )}
      </motion.div>
    </ModalContainer>
  )
}
