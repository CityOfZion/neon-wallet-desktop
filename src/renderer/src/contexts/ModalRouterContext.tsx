import { createContext, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  THistory,
  TModalRouterContextNavigateOptions,
  TModalRouterContextValue,
  TModalRouterProviderProps,
} from '@renderer/@types/modal'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { AnimatePresence } from 'framer-motion'

import { ModalRouterCurrentHistoryProvider } from './ModalRouterCurrentHistoryContext'

type TModalPortalProps = {
  children: React.ReactNode
}
const ModalPortal = ({ children }: TModalPortalProps) => {
  const modalRoot = document.querySelector('body') as HTMLBodyElement
  return createPortal(children, modalRoot)
}

export const ModalRouterContext = createContext<TModalRouterContextValue>({} as TModalRouterContextValue)

export const ModalRouterProvider = ({ routes, children }: TModalRouterProviderProps) => {
  const [histories, setHistories] = useState<THistory[]>([])
  const historiesRef = useRef<THistory[]>([])

  const navigate = useCallback(
    (name: string | number, options?: TModalRouterContextNavigateOptions) => {
      if (typeof name === 'string') {
        const routeExist = routes.find(route => route.name === name)
        if (!routeExist) {
          throw new Error(`Route not found: ${name}`)
        }

        setHistories(prevState => {
          const lastMountedItem = prevState.filter(item => item.status === 'mounted').slice(-1)[0]
          if (lastMountedItem && lastMountedItem.name === name) {
            return prevState.map(item => (item.id === lastMountedItem.id ? { ...item, state: options?.state } : item))
          }

          const newHistory: THistory = {
            name,
            state: options?.state,
            status: 'mounted',
            id: UtilsHelper.uuid(),
            replaced: options?.replace ?? false,
          }
          if (options?.replace) {
            return [...prevState.slice(0, -1), newHistory]
          }

          return [...prevState, newHistory]
        })
        return
      }

      if (name >= 0) {
        throw new Error('Number is only allowed to go back in history')
      }

      setHistories(prevState =>
        prevState.map((item, index) => (index < prevState.length + name ? item : { ...item, status: 'unmounted' }))
      )
    },
    [routes]
  )

  const removeUnmounted = useCallback(() => {
    setHistories(prevState => prevState.filter(item => item.status === 'mounted'))
  }, [])

  useEffect(() => {
    const names = routes.map(route => route.name)
    const uniqueNames = new Set(names)
    if (names.length !== uniqueNames.size) {
      throw new Error('Route names must be unique')
    }
  }, [routes])

  useLayoutEffect(() => {
    historiesRef.current = histories
  }, [histories])

  return (
    <ModalRouterContext.Provider value={{ navigate, histories, historiesRef }}>
      {children}

      <AnimatePresence onExitComplete={removeUnmounted}>
        {histories
          .filter(item => item.status === 'mounted')
          .map((history, index) => {
            const route = routes.find(route => route.name === history.name)!

            return (
              <ModalRouterCurrentHistoryProvider value={history} key={`${route.name}-${index}`}>
                <ModalPortal>{route.element}</ModalPortal>
              </ModalRouterCurrentHistoryProvider>
            )
          })}
      </AnimatePresence>
    </ModalRouterContext.Provider>
  )
}
