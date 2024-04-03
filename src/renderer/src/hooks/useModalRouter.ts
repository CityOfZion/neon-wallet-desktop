import { useCallback, useContext } from 'react'
import { TModalRouterContextNavigateOptions } from '@renderer/@types/modal'
import { ModalRouterContext } from '@renderer/contexts/ModalRouterContext'
import { ModalRouterCurrentHistoryContext } from '@renderer/contexts/ModalRouterCurrentHistoryContext'

export const useModalNavigate = () => {
  const { navigate: modalNavigate } = useContext(ModalRouterContext)

  const modalNavigateWrapper = useCallback(
    (name: string | number, options?: TModalRouterContextNavigateOptions) => {
      return () => {
        modalNavigate(name, options)
      }
    },
    [modalNavigate]
  )

  return {
    modalNavigate,
    modalNavigateWrapper,
  }
}

export const useModalState = <T = any>(): T => {
  const { value } = useContext(ModalRouterCurrentHistoryContext)

  return (value?.state ?? {}) as T
}

export const useModalHistory = () => {
  const { history } = useContext(ModalRouterContext)

  return history
}
