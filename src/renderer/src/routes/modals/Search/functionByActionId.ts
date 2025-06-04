import { useNavigate } from 'react-router-dom'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { BuyAndSellTokensScreenType } from '@renderer/routes/pages/BuyAndSellTokens'
import { IAccountState } from '@shared/@types/store'

type TFunctionParams = {
  modalActions: ReturnType<typeof useModalNavigate>
  pageNavigate: ReturnType<typeof useNavigate>
}

type TFunctionsByActionId = {
  [K in string]: (params: TFunctionParams) => Promise<void>
}

export const functionsByActionId: TFunctionsByActionId = {
  transfer: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/send')
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
    pageNavigate('/app/contacts')
    modalActions.modalNavigate('persist-contact', { replace: true })
  },
  viewContacts: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/contacts')
  },
  swap: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/swap')
  },
  buy: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/buy-and-sell-tokens', { state: { screenType: BuyAndSellTokensScreenType.BUY_TOKENS } })
  },
  sell: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/buy-and-sell-tokens', { state: { screenType: BuyAndSellTokensScreenType.SELL_TOKENS } })
  },
  receive: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/receive')
  },
  createWallet: async ({ modalActions }) => {
    modalActions.modalNavigate('create-wallet-step-1', {
      replace: true,
    })
  },
  encrypt: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/settings/security/encrypt-key')
  },
  createBackup: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/settings/security/backup-wallet')
  },
  import: async ({ modalActions }) => {
    modalActions.modalNavigate('import', {
      replace: true,
    })
  },
  restoreBackup: async ({ pageNavigate, modalActions }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/settings/security/recover-wallet')
  },
  connectHardwareWallet: async ({ modalActions }) => {
    modalActions.modalNavigate('connect-hardware-wallet', {
      replace: true,
    })
  },
  allActivity: async ({ modalActions, pageNavigate }) => {
    modalActions.modalErase('center')
    pageNavigate('/app/portfolio/activity')
  },
  exportFullTransactions: async ({ modalActions }) => {
    modalActions.modalNavigate('export-full-transactions', { replace: true })
  },
  migrationNeo3: async ({ pageNavigate, modalActions }) => {
    modalActions.modalNavigate('select-account', {
      state: {
        blockchain: 'neoLegacy',
        onSelectAccount: (account: IAccountState) => {
          pageNavigate('/app/migration-neo3', { state: { neoLegacyAccount: account } })
        },
      },
      replace: true,
    })
  },
}
