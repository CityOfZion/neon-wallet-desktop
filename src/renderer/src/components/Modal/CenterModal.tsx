import { Suspense, useLayoutEffect, useState } from 'react'

import { FocusScope } from '@radix-ui/react-focus-scope'
import { motion, useAnimate, usePresence } from 'motion/react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalHistories } from '@renderer/hooks/useModalRouter'

import { ModalRouterCurrentHistoryProvider } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import { THistory, TRouterSize } from '@shared/types/modal'

import { ScreenLoader } from '../ScreenLoader'
import { ModalContainer } from './ModalContainer'

const widthBySizes: Partial<Record<TRouterSize, string>> = {
  xs: '24rem',
  sm: '32rem',
  lg: '53rem',
}

const DEFAULT_HEIGHT = '38.75rem'

const heightBySizes: Partial<Record<TRouterSize, string>> = {
  xs: 'auto',
  sm: DEFAULT_HEIGHT,
  lg: DEFAULT_HEIGHT,
}

export const CenterModal = () => {
  const { histories } = useModalHistories()
  const [isPresent, safeToRemove] = usePresence()
  const [scope, animate] = useAnimate()
  const [centerHistories, setCenterHistories] = useState<THistory[]>([])

  const sideHistory = centerHistories[centerHistories.length - 1]
  const size = sideHistory?.route?.size
  const height = (size ? heightBySizes[size] : null) ?? heightBySizes.xs
  const width = (size ? widthBySizes[size] : null) ?? ''

  useLayoutEffect(() => {
    if (!isPresent) return

    setCenterHistories(histories.filter(history => history.route.type === 'center'))
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
    <ModalContainer className="flex items-center justify-center">
      <motion.div
        ref={scope}
        initial={{ scale: 0.95, opacity: 0 }}
        className="relative bg-gray-800"
        style={{ width, height }}
      >
        {width &&
          centerHistories.map((history, index) => (
            <FocusScope
              key={history.id}
              loop
              className={StyleHelper.mergeStyles('h-full w-full', {
                'invisible hidden': index !== centerHistories.length - 1,
              })}
            >
              <ModalRouterCurrentHistoryProvider value={history}>
                <Suspense fallback={<ScreenLoader />}>
                  <history.route.element />
                </Suspense>
              </ModalRouterCurrentHistoryProvider>
            </FocusScope>
          ))}
      </motion.div>
    </ModalContainer>
  )
}
