import type { ComponentType } from 'react'

import type { TModalRouterRouteTypes } from './modal-router'

export type TRoute<N extends keyof TModalRouterRouteTypes = keyof TModalRouterRouteTypes> = {
  element: ComponentType
  name: N
}

export type THistory<T extends keyof TModalRouterRouteTypes = keyof TModalRouterRouteTypes> = {
  id: string
  route: TRoute<T>
  state: TModalRouterRouteTypes[T]
  group: number
}

export type TModalRouterContextNavigateOptions<T extends keyof TModalRouterRouteTypes> =
  undefined extends TModalRouterRouteTypes[T]
    ? [options?: { state?: TModalRouterRouteTypes[T]; replace?: boolean }]
    : [options: { state: TModalRouterRouteTypes[T]; replace?: boolean }]

export type TModalRouterContextValue = {
  navigate(goBackCount: number): void
  navigate<T extends keyof TModalRouterRouteTypes>(name: T, ...args: TModalRouterContextNavigateOptions<T>): void
  erase(history?: THistory): void
  histories: THistory[]
}

export type TModalRouterProviderProps = {
  router: TRoute[][]
  children?: React.ReactNode
}

export type TModalRouterCurrentHistoryContextValue = {
  history: THistory
  isFocused: boolean
  index: number
}

export type TModalRouterCurrentHistoryProviderProps = TModalRouterCurrentHistoryContextValue & {
  children: React.ReactNode
}

export type TModalState<K extends keyof TModalRouterRouteTypes> = TModalRouterRouteTypes[K]
