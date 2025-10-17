import { useContext, useEffect } from 'react'

import { useModalHistories } from '@renderer/hooks/useModalRouter'

import { ModalRouterCurrentHistoryContext } from '@renderer/contexts/ModalRouterCurrentHistoryContext'

export const useModalRouterOnClose = (callback?: () => void) => {
  const currentHistory = useContext(ModalRouterCurrentHistoryContext)
  const { histories } = useModalHistories()

  if (!currentHistory) throw new Error('The useModalRouterOnClose hook can only be used inside a modal')

  useEffect(() => {
    const isCurrentHistoryRendered = histories.find(({ id }) => id === currentHistory.value.id)

    if (!isCurrentHistoryRendered) callback?.()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histories])
}
