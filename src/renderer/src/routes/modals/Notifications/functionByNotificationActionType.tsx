import { useNavigate } from 'react-router'
import { match } from 'ts-pattern'

import { selectAccounts } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { store } from '@renderer/libs/redux'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { getI18next } from '@shared/libs/i18next'
import { TAccountHelperPredicateParams } from '@shared/types/helpers'
import { TNotificationAction } from '@shared/types/store'

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
  const state = store.getState()
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

        modalActions.modalErase()
        pageNavigate('/wallets/overview', { state: { account } })
      })
      .with({ to: 'account-transaction' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase()
        pageNavigate('/wallets/transactions', { state: { account } })
      })
      .with({ to: 'account-tokens' }, ({ address, blockchain }) => {
        const account = getAccount({ address, blockchain })

        modalActions.modalErase()

        setTimeout(() => {
          pageNavigate('/wallets/tokens', { state: { account } })
        }, 500)
      })
      .with({ to: 'hide-fraudulent-token' }, ({ address, blockchain, tokenHash }) => {
        const account = getAccount({ address, blockchain })

        modalActions.modalErase()

        setTimeout(() => {
          if (tokenHash) {
            modalActions.modalNavigate('hide-fraudulent-token', { state: { account, hash: tokenHash } })
          } else {
            pageNavigate('/wallets/tokens', { state: { account } })
          }
        }, 500)
      })
      .with({ to: 'vote-neo3' }, payload => {
        const account = getAccount(payload)

        modalActions.modalErase()
        pageNavigate('/vote-neo3', { state: { defaultNeo3Account: account } })
      })
      .with({ to: 'backup-wallet' }, () => {
        modalActions.modalErase()
        pageNavigate('/settings/security/backup-wallet')
      })
      .otherwise(() => {
        // No action needed for unhandled navigation types
      })
  },
}
