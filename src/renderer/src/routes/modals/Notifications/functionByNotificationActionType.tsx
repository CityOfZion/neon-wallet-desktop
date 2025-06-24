import { useNavigate } from 'react-router-dom'
import { selectAccounts } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { RootStore } from '@renderer/store/RootStore'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { TNotificationAction } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { getI18next } from '@shared/libs/i18next'
import { match } from 'ts-pattern'

type TFunctionParams<T> = {
  modalActions: ReturnType<typeof useModalNavigate>
  pageNavigate: ReturnType<typeof useNavigate>
  notificationAction: T
}

type TFunctionByNotificationActionType = {
  [K in TNotificationAction['type']]: (params: TFunctionParams<TNotificationAction & { type: K }>) => Promise<void>
}

const { t } = getI18next()

const getAccount = (predicate: TAccountHelperPredicateParams) => {
  const state = RootStore.store.getState()
  const accounts = selectAccounts(state)
  const account = accounts.find(SharedAccountHelper.predicate(predicate))

  if (!account) {
    throw new Error(t('modals:notifications.errors.accountNotFound'))
  }

  return account
}

export const functionByNotificationActionType: TFunctionByNotificationActionType = {
  navigate: async ({ modalActions, pageNavigate, notificationAction }) => {
    match(notificationAction.payload)
      .with({ to: 'account' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase('side')
        pageNavigate(`/app/wallets/${account.id}`)
      })
      .with({ to: 'account-transaction' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase('side')
        pageNavigate(`/app/wallets/${account.id}/transactions`)
      })
      .with({ to: 'migration-neo3' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase('side')
        pageNavigate('/app/migration-neo3', { state: { neoLegacyAccount: account } })
      })
      .with({ to: 'vote-neo3' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase('side')
        pageNavigate('/app/vote-neo3', { state: { defaultNeo3Account: account } })
      })
      .exhaustive()
  },
}
