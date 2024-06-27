import { useLayoutEffect, useMemo, useState } from 'react'
import { ModalRouterCurrentHistoryProvider } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalHistories } from '@renderer/hooks/useModalRouter'
import { THistory, TRouterSize } from '@shared/@types/modal'
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

  const [sideHistories, setSideHistories] = useState<THistory[]>([])

  const lastSideHistoryWidth = useMemo(() => {
    const lastSideHistory = sideHistories[sideHistories.length - 1]
    if (!lastSideHistory) return

    const widthBySize = widthBySizes[lastSideHistory.route.size ?? 'sm']
    if (!widthBySize) throw new Error('Invalid size')

    return widthBySize
  }, [sideHistories])

  useLayoutEffect(() => {
    if (!isPresent) return

    setSideHistories(histories.filter(history => history.route.type === 'side'))
  }, [histories, isPresent])

  useLayoutEffect(() => {
    if (!lastSideHistoryWidth) return

    if (isPresent) {
      animate(scope.current, { width: lastSideHistoryWidth }, { type: 'spring', duration: 0.2 })
    } else {
      const exitAnimation = async () => {
        await animate(scope.current, { width: 0 }, { duration: 0.1 })
        safeToRemove()
      }

      exitAnimation()
    }
  }, [lastSideHistoryWidth, isPresent, animate, scope, safeToRemove])

  return (
    <ModalContainer className="flex justify-end">
      <motion.div className="h-full relative" ref={scope} initial={{ width: 0 }}>
        {lastSideHistoryWidth &&
          sideHistories.map((history, index) => (
            <div
              className={StyleHelper.mergeStyles(`min-w-[${lastSideHistoryWidth}] h-full`, {
                'invisible hidden': index !== sideHistories.length - 1,
              })}
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
