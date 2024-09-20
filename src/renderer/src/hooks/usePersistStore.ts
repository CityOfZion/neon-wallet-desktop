import { useCallback } from 'react'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { walletReducerActions } from '@renderer/store/reducers/WalletReducer'
import { RootStore } from '@renderer/store/RootStore'

import { useAppDispatch } from './useRedux'
import { useLoginSessionSelector } from './useSettingsSelector'

export const usePersistStore = () => {
  const dispatch = useAppDispatch()
  const { loginSessionRef } = useLoginSessionSelector()

  const pause = useCallback(() => {
    // Pause the persistor to avoid saving the temporary wallet to the local storage
    RootStore.persistor.pause()

    // Reset the store since the local storage was already loaded on start up
    dispatch(walletReducerActions.clean())
    dispatch(accountReducerActions.clean())
  }, [dispatch])

  const resume = useCallback(async () => {
    if (loginSessionRef.current?.type === 'hardware') {
      await dispatch(accountReducerActions.restoreToPersistedData())
      await dispatch(walletReducerActions.restoreToPersistedData())
    }
    // Resume the persist store since we paused it when logged in with hardware wallet
    RootStore.persistor.persist()
  }, [dispatch, loginSessionRef])

  return {
    pause,
    resume,
  }
}
