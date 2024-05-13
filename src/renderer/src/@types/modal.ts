export type TRouteType = 'side' | 'center'
export type TRouterSize = 'sm' | 'md' | 'lg' | 'xl'

export type TRoute = {
  element: JSX.Element
  name: string
  type: TRouteType
  size?: TRouterSize
}

export type THistory<T = any> = {
  state: T
  id: string
  route: TRoute
}

export type TModalRouterContextNavigateOptions = Partial<Pick<THistory, 'state'>>

export type TModalRouterContextValue = {
  navigate: (name: string | number, options?: TModalRouterContextNavigateOptions) => void
  erase: (type: TRouteType) => void
  histories: THistory[]
  historiesRef: React.MutableRefObject<THistory[]>
}

export type TModalRouterProviderProps = {
  routes: TRoute[]
  children: React.ReactNode
}

export type TModalRouterCurrentHistoryContextValue<T = any> = {
  value: THistory<T>
}

export type TModalRouterCurrentHistoryProviderProps<T = any> = {
  value: THistory<T>
  children: React.ReactNode
}
