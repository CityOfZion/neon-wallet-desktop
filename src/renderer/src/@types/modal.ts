export type THistory<T = any> = {
  name: string
  state: T
  status: 'mounted' | 'unmounted'
  id: string
  replaced: boolean
}

export type TRoute = {
  element: JSX.Element
  name: string
}

export type TModalRouterContextValue = {
  navigate: (name: string | number, options?: TModalRouterContextNavigateOptions) => void
  histories: THistory[]
  historiesRef: React.MutableRefObject<THistory[]>
}

export type TModalRouterProviderProps = {
  routes: TRoute[]
  children: React.ReactNode
}

export type TModalRouterContextNavigateOptions = {
  state?: any
  replace?: boolean
}

export type TModalRouterCurrentHistoryContextValue<T = any> = {
  value: THistory<T>
}

export type TModalRouterCurrentHistoryProviderProps<T = any> = {
  value: THistory<T>
  children: React.ReactNode
}
