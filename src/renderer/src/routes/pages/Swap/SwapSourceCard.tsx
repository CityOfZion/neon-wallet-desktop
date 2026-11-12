import { useEffect } from 'react'

import { type ISwapOrchestrator, SwapHelper } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Separator } from '@renderer/components/Separator'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useLazyBalance } from '@renderer/hooks/useBalances'

import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TAccount } from '@shared/types/store'

type TProps = {
  swapOrchestrator: ISwapOrchestrator
  accountToUse?: TAccount
  initialAccount?: TAccount
  disabled: boolean
}

export const SwapSourceCard = ({ swapOrchestrator, accountToUse, initialAccount, disabled }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap.sourceCard' })
  const { getBalance } = useLazyBalance()

  const supportedBlockchains = BlockchainServiceHelper.blockchainNames.filter(blockchain =>
    SwapHelper.isBlockchainSupported(blockchain, BlockchainServiceHelper.bsAggregator)
  )

  const handleSelectAccountToUse = async (account: TAccount) => {
    if (!account.encryptedKey) return

    try {
      const serviceAccount = await AccountHelper.getServiceAccount(account)
      await swapOrchestrator.setAccountToUse(serviceAccount)

      const balance = await getBalance(account)
      await swapOrchestrator.setAccountToUseBalances(balance.tokensBalances)
    } catch (error) {
      LoggerHelper.error(error, { where: 'SwapSourceCard', operation: 'handleSelectAccountToUse' })
      ToastHelper.error({ message: AppError.wrap(error).displayMessage })
    }
  }

  // The orchestrator is recreated on restart, so the initial account must be selected again
  useEffect(() => {
    if (initialAccount) handleSelectAccountToUse(initialAccount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAccount, swapOrchestrator])

  return (
    <div className="flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4">
      <ActionStep
        title={t('source')}
        leftIcon={<TbWallet aria-hidden className="min-size-6 max-size-6 size-6" />}
        className="font-bold"
      />

      <Separator />

      <ActionStep
        title={t('accountToUseTitle')}
        leftIcon={<VscCircleFilled aria-hidden className="min-size-2 max-size-2 size-2 text-gray-300" />}
        className="mb-2"
      >
        <GreyAccountSelect
          selectedAccount={accountToUse}
          onSelect={handleSelectAccountToUse}
          blockchains={supportedBlockchains}
          disabled={disabled}
        />
      </ActionStep>
    </div>
  )
}
