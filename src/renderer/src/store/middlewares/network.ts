import { createListenerMiddleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import type { TRootState } from '@renderer/types/redux'

import { settingsReducerActions } from '../reducers/settings'

export function getNetworkMiddleware() {
  const networkListenerMiddleware = createListenerMiddleware()

  networkListenerMiddleware.startListening({
    predicate: action =>
      settingsReducerActions.setSelectNetworkProfile.match(action) ||
      settingsReducerActions.saveNetworkProfile.match(action) ||
      settingsReducerActions.editNetworkProfile.match(action) ||
      settingsReducerActions.deleteNetworkProfile.match(action) ||
      settingsReducerActions.saveCustomNetwork.match(action) ||
      settingsReducerActions.deleteCustomNetwork.match(action) ||
      (action.type === REHYDRATE && action.key === 'settingsReducer'),
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState() as TRootState

      const selectedNetworkProfile = state.settings?.data?.selectedNetworkProfile
      if (!selectedNetworkProfile) return

      Object.values(bsAggregator.blockchainServicesByName).forEach(service => {
        service.setNetwork(selectedNetworkProfile.networkByBlockchain[service.name])
      })
    },
  })

  return networkListenerMiddleware.middleware
}
