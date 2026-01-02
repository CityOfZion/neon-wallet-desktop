import { createListenerMiddleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import type { TRootState } from '@renderer/types/redux'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

import { settingsReducerActions } from '../reducers/settings'

export function getLanguageMiddleware() {
  const languageListenerMiddleware = createListenerMiddleware()

  languageListenerMiddleware.startListening({
    predicate: action =>
      settingsReducerActions.setLanguage.match(action) ||
      (action.type === REHYDRATE && action.key === 'settingsReducer'),
    effect: (_action, listenerApi) => {
      const state = listenerApi.getState() as TRootState

      const language = state.settings?.data?.language
      if (!language) return

      const i18next = SharedI18nextHelper.get()
      i18next.changeLanguage(language.value)
    },
  })

  return languageListenerMiddleware.middleware
}
