import { createListenerMiddleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import type { TRootState } from '@renderer/types/redux'

import { authReducerActions } from '../reducers/auth'

export function getTemporaryDataMiddleware() {
  const networkListenerMiddleware = createListenerMiddleware()

  networkListenerMiddleware.startListening({
    predicate: action =>
      authReducerActions.setCurrentLoginSession.match(action) ||
      (action.type === REHYDRATE && action.key === 'authReducer'),
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState() as TRootState

      const currentLoginSession = state.auth?.inMemoryData.currentLoginSession
      if (currentLoginSession) return

      listenerApi.dispatch(authReducerActions.resetTemporaryApplicationData())
    },
  })

  return networkListenerMiddleware.middleware
}
