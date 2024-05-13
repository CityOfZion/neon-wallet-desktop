import { useCallback, useContext } from 'react'
import { TModalRouterContextNavigateOptions, TRouteType } from '@renderer/@types/modal'
import { ModalRouterContext } from '@renderer/contexts/ModalRouterContext'
import { ModalRouterCurrentHistoryContext } from '@renderer/contexts/ModalRouterCurrentHistoryContext'

export const useModalNavigate = () => {
  const { navigate: modalNavigate, erase: modalErase } = useContext(ModalRouterContext)

  const modalNavigateWrapper = useCallback(
    (name: string | number, options?: TModalRouterContextNavigateOptions) => {
      return () => {
        modalNavigate(name, options)
      }
    },
    [modalNavigate]
  )

  const modalEraseWrapper = useCallback(
    (type: TRouteType) => {
      return () => {
        modalErase(type)
      }
    },
    [modalErase]
  )

  return {
    modalNavigate,
    modalNavigateWrapper,
    modalErase,
    modalEraseWrapper,
  }
}

export const useModalState = <T = any>(): T => {
  const { value } = useContext(ModalRouterCurrentHistoryContext)

  return (value?.state ?? {}) as T
}

export const useModalHistories = () => {
  const { histories, historiesRef } = useContext(ModalRouterContext)

  return { histories, historiesRef }
}
