import { useNavigate } from 'react-router'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { IAccountState } from '@shared/types/store'

type TFunctionParams = {
  modalActions: ReturnType<typeof useModalNavigate>
  pageNavigate: ReturnType<typeof useNavigate>
}

type TFunctionsByActionId = {
  [K in string]: (params: TFunctionParams) => Promise<void>
}

export const functionsByActionId: TFunctionsByActionId = {
  transfer: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/send')
  },
  connect: async ({ modalActions }) => {
    modalActions.modalNavigate('select-account', {
      state: {
        onSelectAccount: (account: IAccountState) => {
          modalActions.modalNavigate('dapp-connection', { state: { account: account } })
        },
      },
      replace: true,
    })
  },
  createContact: async ({ modalActions, pageNavigate }) => {
    pageNavigate('/contacts')
    modalActions.modalNavigate('persist-contact', { replace: true })
  },
  viewContacts: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/contacts')
  },
  swap: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/swap')
  },
  buy: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/buy-and-sell-tokens/buy')
  },
  sell: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/buy-and-sell-tokens/sell')
  },
  receive: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/receive')
  },
  createWallet: async ({ modalActions }) => {
    modalActions.modalNavigate('create-wallet-step-1', {
      replace: true,
    })
  },
  encrypt: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/settings/security/encrypt-key')
  },
  createBackup: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/settings/security/backup-wallet')
  },
  import: async ({ modalActions }) => {
    modalActions.modalNavigate('import', { replace: true })
  },
  restoreBackup: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase()
    pageNavigate('/settings/security/recover-wallet')
  },
  connectHardwareWallet: async ({ modalActions }) => {
    modalActions.modalNavigate('connect-hardware-wallet', {
      replace: true,
    })
  },
  allActivity: async ({ modalActions, pageNavigate }) => {
    modalActions.modalErase()
    pageNavigate('/portfolio/activity')
  },
  exportFullTransactions: async ({ modalActions }) => {
    modalActions.modalNavigate('export-full-transactions', { replace: true })
  },
  voteNeo3: async ({ modalActions, pageNavigate }) => {
    modalActions.modalErase()
    pageNavigate('/vote-neo3')
  },
  neo3NeoXBridge: async ({ modalActions, pageNavigate }) => {
    modalActions.modalErase()
    pageNavigate('/neo3-neox-bridge')
  },
}
