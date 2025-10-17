import { createListenerMiddleware } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'

import type { TRootState } from '@renderer/types/redux'
import { getI18next } from '@shared/libs/i18next'

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

      const i18next = getI18next()
      i18next.changeLanguage(language.value)
    },
  })

  return languageListenerMiddleware.middleware
}
