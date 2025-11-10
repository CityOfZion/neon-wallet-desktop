import { createContext, Suspense, useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'motion/react'

import { ScreenLoader } from '@renderer/components/ScreenLoader'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import type { THistory, TModalRouterContextValue, TModalRouterProviderProps, TRoute } from '@shared/types/modal'
import type { TModalRouterRouteTypes } from '@shared/types/modal-router'

import { ModalRouterCurrentHistoryProvider } from './ModalRouterCurrentHistoryContext'

export const ModalRouterContext = createContext<TModalRouterContextValue>({} as TModalRouterContextValue)

export const ModalRouterProvider = ({ router, children }: TModalRouterProviderProps) => {
  const [histories, setHistories] = useState<THistory[]>([])

  const routesMap = useMemo(() => {
    const map = new Map<string, { route: TRoute; group: number }>()

    router.forEach((routes, group) => {
      routes.forEach(route => {
        map.set(route.name, { route, group })
      })
    })

    return map
  }, [router])

  const historiesByGroupMap = useMemo(() => {
    const map = new Map<number, THistory[]>()

    histories.forEach(history => {
      const groupHistories = map.get(history.group) || []
      groupHistories.push(history)
      map.set(history.group, groupHistories)
    })

    return map
  }, [histories])

  const navigate = useCallback(
    (name: keyof TModalRouterRouteTypes | number, options?: any) => {
      if (typeof name === 'number') {
        if (name >= 0) {
          throw new Error('When navigating by index, the value must be negative')
        }

        setHistories(prevState => prevState.slice(0, name))
        return
      }

      const routeExist = routesMap.get(name)
      if (!routeExist) {
        throw new Error(`Route not found: ${name}`)
      }

      setHistories(prevState => {
        const lastItem = prevState.slice(-1)[0]
        const state = options && 'state' in options ? options.state : undefined
        if (lastItem && lastItem.route.name === name) {
          return prevState.map(item => (item.id === lastItem.id ? { ...item, state } : item))
        }

        const newHistory: THistory = {
          id: UtilsHelper.uuid(),
          state,
          route: routeExist.route,
          group: routeExist.group,
        }

        if (options?.replace) {
          return [...prevState.slice(0, -1), newHistory]
        }

        return [...prevState, newHistory]
      })

      return
    },
    [routesMap]
  )

  const erase = useCallback(
    (history?: THistory) => {
      if (!history) {
        setHistories([])
        return
      }

      const routeExist = routesMap.get(history.route.name)
      if (!routeExist) {
        throw new Error(`Route not found: ${history.route.name}`)
      }

      setHistories(prevState =>
        prevState.filter(item => {
          const itemExist = routesMap.get(item.route.name)
          return itemExist?.group !== routeExist.group
        })
      )
    },
    [routesMap]
  )

  return (
    <ModalRouterContext.Provider value={{ navigate, erase, histories }}>
      {children}

      {createPortal(
        <AnimatePresence>
          {historiesByGroupMap.entries().map(([group, groupHistories], index) => (
            <div
              key={group}
              className="fixed top-[var(--drag-region-height)] left-0 h-[var(--height-screen-minus-drag-region)] w-screen overflow-hidden"
              style={{ zIndex: 1000 + index }}
            >
              <motion.div
                className="absolute top-0 left-0 h-full w-full bg-gray-900/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <AnimatePresence propagate>
                {groupHistories.map((groupHistory, groupIndex) => (
                  <ModalRouterCurrentHistoryProvider
                    history={groupHistory}
                    groupIndex={groupIndex}
                    key={groupHistory.id}
                    isFocused={histories[histories.length - 1]?.id === groupHistory?.id}
                    isGroupFocused={index === groupHistories.length - 1}
                  >
                    <Suspense fallback={<ScreenLoader />}>
                      <groupHistory.route.element />
                    </Suspense>
                  </ModalRouterCurrentHistoryProvider>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>,
        document.querySelector('#root')!
      )}
    </ModalRouterContext.Provider>
  )
}
