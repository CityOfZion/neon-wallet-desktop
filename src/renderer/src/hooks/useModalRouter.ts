import { useCallback, useContext } from 'react'

import { ModalRouterContext } from '@renderer/contexts/ModalRouterContext'
import { ModalRouterCurrentHistoryContext } from '@renderer/contexts/ModalRouterCurrentHistoryContext'
import type { TModalRouterContextNavigateOptions } from '@shared/types/modal'
import type { TModalRouterRouteTypes } from '@shared/types/modal-router'

export const useModalRouter = () => {
  const modalRouterContext = useContext(ModalRouterContext)

  if (!modalRouterContext) {
    throw new Error('useModalEraseHandler must be used within a ModalRouterModalContainerProvider')
  }
  return modalRouterContext
}

export const useModalCurrentHistory = () => {
  const modalCurrentHistoryContext = useContext(ModalRouterCurrentHistoryContext)

  if (!modalCurrentHistoryContext) {
    throw new Error('useCurrentModalHistory must be used within a ModalRouterCurrentHistoryProvider')
  }

  return modalCurrentHistoryContext
}

export const useModalNavigate = () => {
  const modalRouteContext = useContext(ModalRouterContext)
  const modalCurrentHistoryContext = useContext(ModalRouterCurrentHistoryContext)

  if (!modalRouteContext) {
    throw new Error('useModalNavigate must be used within a ModalRouterProvider')
  }

  const modalNavigateWrapper = useCallback(
    ((nameOrCount: any, ...args: any) => {
      return () => {
        modalRouteContext.navigate(nameOrCount, ...args)
      }
    }) as {
      (goBackCount: number): () => void
      <T extends keyof TModalRouterRouteTypes>(name: T, ...args: TModalRouterContextNavigateOptions<T>): () => void
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalRouteContext.navigate]
  )

  const modalErase = useCallback(() => {
    modalRouteContext.erase(modalCurrentHistoryContext?.history)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalCurrentHistoryContext?.history, modalRouteContext.erase])

  const modalEraseWrapper = useCallback(() => {
    return () => {
      modalErase()
    }
  }, [modalErase])

  return {
    modalNavigate: modalRouteContext.navigate,
    modalNavigateWrapper,
    modalErase,
    modalEraseWrapper,
  }
}

export const useModalState = <T>(): T => {
  const context = useContext(ModalRouterCurrentHistoryContext)

  if (!context) {
    throw new Error('useModalState must be used within a ModalRouterCurrentHistoryProvider')
  }

  return context.history?.state as T
}
