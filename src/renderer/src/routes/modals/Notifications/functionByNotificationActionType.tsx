import { useNavigate } from 'react-router-dom'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { selectAccounts } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { RootStore } from '@renderer/store/RootStore'
import { TAccountHelperPredicateParams } from '@shared/@types/helpers'
import { TNotificationAction } from '@shared/@types/store'
import { match } from 'ts-pattern'

type TFunctionParams<T> = {
  modalActions: ReturnType<typeof useModalNavigate>
  pageNavigate: ReturnType<typeof useNavigate>
  notificationAction: T
}

type TFunctionByNotificationActionType = {
  [K in TNotificationAction['type']]: (params: TFunctionParams<TNotificationAction & { type: K }>) => Promise<void>
}

const getAccount = (predicate: TAccountHelperPredicateParams) => {
  const state = RootStore.store.getState()
  const accounts = selectAccounts(state)

  return accounts.find(AccountHelper.predicate(predicate))
}

export const functionByNotificationActionType: TFunctionByNotificationActionType = {
  navigate: async ({ modalActions, pageNavigate, notificationAction }) => {
    match(notificationAction.payload)
      .with({ to: 'account' }, payload => {
        const account = getAccount(payload)
        if (!account) return

        modalActions.modalErase('side')
        pageNavigate(`/app/wallets/${account.id}`)
      })
      .with({ to: 'account-transaction' }, payload => {
        const account = getAccount(payload)
        if (!account) return

        modalActions.modalErase('side')
        pageNavigate(`/app/wallets/${account.id}/transactions`)
      })
  },
}
