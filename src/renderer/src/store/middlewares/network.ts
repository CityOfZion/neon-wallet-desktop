import { createListenerMiddleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import type { TRootState } from '@renderer/types/redux'

import { settingsReducerActions } from '../reducers/settings'

export function getNetworkMiddleware() {
  const networkListenerMiddleware = createListenerMiddleware()
  const services = Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)

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

      services.forEach(service => {
        service.setNetwork(selectedNetworkProfile.networkByBlockchain[service.name])
      })
    },
  })

  return networkListenerMiddleware.middleware
}
