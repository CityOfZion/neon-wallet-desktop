import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CenterModal } from '@renderer/components/Modal/CenterModal'
import { SideModal } from '@renderer/components/Modal/SideModal'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useDelayedState } from '@renderer/hooks/useDelayedState'
import {
  THistory,
  TModalRouterContextNavigateOptions,
  TModalRouterContextValue,
  TModalRouterProviderProps,
  TRouteType,
} from '@shared/@types/modal'
import { AnimatePresence } from 'framer-motion'

const modalByRouteType: Record<TRouteType, (...props: any[]) => JSX.Element> = {
  side: SideModal,
  center: CenterModal,
}

export const ModalRouterContext = createContext<TModalRouterContextValue>({} as TModalRouterContextValue)

export const ModalRouterProvider = ({ routes, children }: TModalRouterProviderProps) => {
  const [histories, setHistories] = useDelayedState<THistory[]>([], { shouldCancelBeforeSet: false })
  const historiesRef = useRef<THistory[]>([])

  const typesToRender = useMemo<TRouteType[]>(() => {
    const uniqueTypes = new Set(histories.map(history => history.route.type))
    return Array.from(uniqueTypes)
  }, [histories])

  const navigate = useCallback(
    (name: string | number, options?: TModalRouterContextNavigateOptions) => {
      if (typeof name === 'string') {
        const routeExist = routes.find(route => route.name === name)
        if (!routeExist) {
          throw new Error(`Route not found: ${name}`)
        }

        setHistories(prevState => {
          const lastItem = prevState.slice(-1)[0]
          if (lastItem && lastItem.route.name === name) {
            return prevState.map(item => (item.id === lastItem.id ? { ...item, state: options?.state } : item))
          }

          const newHistory: THistory = {
            id: UtilsHelper.uuid(),
            state: options?.state,
            route: routeExist,
            replace: options?.replace ?? false,
          }

          if (options?.replace && prevState.length > 0) {
            return prevState.map((item, index, array) => (index === array.length - 1 ? newHistory : item))
          }

          return [...prevState, newHistory]
        }, 10)
        return
      }

      if (name >= 0) {
        throw new Error('Number is only allowed to go back in history')
      }

      setHistories(prevState => prevState.slice(0, name), 10)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routes]
  )

  const erase = useCallback(async (type: TRouteType) => {
    setHistories(prevState => prevState.filter(history => history.route.type !== type), 10)

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <ModalRouterContext.Provider value={{ navigate, erase, histories, historiesRef }}>
      {children}

      <AnimatePresence>
        {typesToRender.map(type => {
          const Component = modalByRouteType[type]

          return <Component key={type} />
        })}
      </AnimatePresence>
    </ModalRouterContext.Provider>
  )
}
