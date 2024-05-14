import { useLayoutEffect, useMemo, useState } from 'react'
import { THistory, TRouterSize } from '@renderer/@types/modal'
import { ModalRouterCurrentHistoryProvider } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
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

  const [centerHistories, setCenterHistories] = useState<THistory[]>([])

  const lastCenterHistoryWidth = useMemo(() => {
    const lastSideHistory = centerHistories[centerHistories.length - 1]
    if (!lastSideHistory) return

    const widthBySize = widthBySizes[lastSideHistory.route.size ?? 'sm']
    if (!widthBySize) throw new Error('Invalid size')

    return widthBySize
  }, [centerHistories])

  useLayoutEffect(() => {
    if (!isPresent) return

    setCenterHistories(histories.filter(history => history.route.type === 'center'))
  }, [histories, isPresent])

  useLayoutEffect(() => {
    if (!lastCenterHistoryWidth) return

    if (isPresent) {
      animate(scope.current, { scale: 1, opacity: 1, width: lastCenterHistoryWidth }, { type: 'spring', duration: 0.1 })
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { scale: 0.95, opacity: 0 }, { duration: 0.1 })
        safeToRemove()
      }

      exitAnimation()
    }
  }, [lastCenterHistoryWidth, isPresent, animate, scope, safeToRemove])

  return (
    <ModalContainer className="flex justify-center items-center">
      <motion.div className="relative h-[38.75rem]" ref={scope} initial={{ scale: 0.95, opacity: 0 }}>
        {lastCenterHistoryWidth &&
          centerHistories.map((history, index) => (
            <div
              className={StyleHelper.mergeStyles(
                `min-w-[${lastCenterHistoryWidth}] max-w-[${lastCenterHistoryWidth}] h-full`,
                {
                  'invisible hidden': index !== centerHistories.length - 1,
                }
              )}
              key={history.id}
            >
              <ModalRouterCurrentHistoryProvider value={history}>
                {history.route.element}
              </ModalRouterCurrentHistoryProvider>
            </div>
          ))}
      </motion.div>
    </ModalContainer>
  )
}
