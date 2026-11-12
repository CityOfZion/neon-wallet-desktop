import { ChangeEvent, Fragment } from 'react'

import { hasMemo } from '@cityofzion/blockchain-service'
import type { ISwapOrchestrator, TSwapOrchestratorState, TSwapToken, TSwapTokenToUse } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useHasContactsByBlockchain } from '@renderer/hooks/useContactSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'

import MdContentPasteGo from '@renderer/assets/images/md-content-paste-go.svg?react'
import TbDiamond from '@renderer/assets/images/tb-diamond.svg?react'
import TbHelp from '@renderer/assets/images/tb-help.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TBalance } from '@shared/types/query'
import type { TAccount, TContactAddress } from '@shared/types/store'

type TProps = {
  swapOrchestrator: ISwapOrchestrator
  state: TSwapOrchestratorState
  balance?: TBalance
  isLoadingBalance: boolean
  disabled: boolean
}

export const SwapAssetsCard = ({ swapOrchestrator, state, balance, isLoadingBalance, disabled }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap.assetsCard' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { accounts } = useAccountsSelector()

  const tokenToUse = state.tokenToUse.value
  const tokenToReceive = state.tokenToReceive.value
  const tokenToReceiveBlockchain = tokenToReceive?.blockchain

  const { hasContactsByBlockchain } = useHasContactsByBlockchain(tokenToReceiveBlockchain)

  const hasAccountsToReceive = accounts.some(({ blockchain }) => blockchain === tokenToReceiveBlockchain)

  const tokenToReceiveService = tokenToReceiveBlockchain
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByName[tokenToReceiveBlockchain]
    : undefined

  // The swap backend does not tell which tokens need a destination tag/memo, so it is shown for blockchains with memo support and blockchains not supported by Neon
  const hasExtraIdToReceive = !!tokenToReceive && (!tokenToReceiveService || hasMemo(tokenToReceiveService))

  const [isPastingAddressToReceive, handlePasteAddressToReceive] = usePressOnce(async () => {
    try {
      await swapOrchestrator.setAddressToReceive(await ClipboardHelper.read())
    } catch (error) {
      LoggerHelper.error(error, { where: 'SwapAssetsCard', operation: 'pasteAddressToReceive' })
      ToastHelper.error({ message: AppError.wrap(error, tCommonGeneral('pasteFromClipboardError')).displayMessage })
    }
  })

  const handleSelectTokenToUse = async (token: TSwapTokenToUse) => {
    await swapOrchestrator.setAmountToUse(null)
    await swapOrchestrator.setTokenToUse(token)
  }

  const handleSelectTokenToReceive = (token: TSwapToken) => {
    swapOrchestrator.setTokenToReceive(token)
  }

  const handleChangeAddressToReceive = (event: ChangeEvent<HTMLInputElement>) => {
    swapOrchestrator.setAddressToReceive(event.target.value || null)
  }

  const handleSelectContactToReceive = (address: TContactAddress) => {
    swapOrchestrator.setAddressToReceive(address.address)
  }

  const handleSelectAccountToReceive = (account: TAccount) => {
    swapOrchestrator.setAddressToReceive(account.address)
  }

  const handleChangeExtraIdToReceive = (event: ChangeEvent<HTMLInputElement>) => {
    swapOrchestrator.setExtraId(event.target.value || null)
  }

  return (
    <div className="mt-2.5 flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4 pb-4">
      <ActionStep title={t('assets')} leftIcon={<TbDiamond aria-hidden />} className="font-bold" />

      <Separator />

      <ActionStep
        title={t('tokenToUseTitle')}
        leftIcon={<VscCircleFilled aria-hidden className="max-size-2 min-size-2 size-2 text-gray-300" />}
      >
        <GreyTokenSelect
          tokens={state.availableTokensToUse.value || []}
          loading={state.availableTokensToUse.loading || isLoadingBalance}
          onSelect={handleSelectTokenToUse}
          selectedToken={tokenToUse || undefined}
          balance={balance}
          disabled={disabled || !state.accountToUse.value}
        />
      </ActionStep>

      <Separator />

      <ActionStep
        title={t('tokenToReceiveTitle')}
        leftIcon={<VscCircleFilled aria-hidden className="max-size-2 min-size-2 size-2 text-gray-300" />}
      >
        <GreyTokenSelect
          tokens={state.availableTokensToReceive.value || []}
          loading={state.availableTokensToReceive.loading}
          onSelect={handleSelectTokenToReceive}
          selectedToken={tokenToReceive || undefined}
          disabled={disabled || !tokenToUse}
        />
      </ActionStep>

      <Separator />

      <ActionStep
        title={t('receiveHere')}
        leftIcon={<VscCircleFilled aria-hidden className="max-size-2 min-size-2 size-2 text-gray-300" />}
      >
        <div className="flex grow gap-3">
          <Input
            value={state.addressToReceive.value || ''}
            onChange={handleChangeAddressToReceive}
            compacted
            containerClassName="w-auto grow"
            placeholder={t('addressToReceivePlaceholder')}
            clearable={false}
            rightElement={
              <Fragment>
                <IconButton
                  aria-label={tCommonGeneral('pasteFromClipboard')}
                  colorSchema="neon"
                  type="button"
                  compacted
                  disabled={disabled || !tokenToReceive || isPastingAddressToReceive}
                  icon={<MdContentPasteGo aria-hidden className="min-size-4 max-size-4 size-4" />}
                  onClick={handlePasteAddressToReceive}
                />

                <IconButton
                  icon={<TbUsers aria-hidden className="min-size-4 max-size-4 size-4" />}
                  colorSchema="neon"
                  type="button"
                  onClick={modalNavigateWrapper('select-contact', {
                    state: {
                      onSelectContact: handleSelectContactToReceive,
                      blockchain: tokenToReceiveBlockchain,
                    },
                  })}
                  compacted
                  disabled={disabled || !tokenToReceiveBlockchain || !hasContactsByBlockchain}
                />
              </Fragment>
            }
            loading={state.addressToReceive.formatting || state.addressToReceive.validating}
            errorMessage={state.addressToReceive.valid === false ? t('errors.invalidAddress') : undefined}
            hint={tokenToReceive && !tokenToReceiveBlockchain ? t('hints.enterValidAddress') : undefined}
            disabled={disabled || !tokenToReceive}
          />

          <GreyAccountSelect
            blockchains={tokenToReceiveBlockchain ? [tokenToReceiveBlockchain] : undefined}
            disabled={disabled || !hasAccountsToReceive}
            onSelect={handleSelectAccountToReceive}
            placement="dropdownEnd"
          >
            <Button
              disabled={disabled || !hasAccountsToReceive}
              variant="text"
              label={t('myAccountsButtonLabel')}
              leftIcon={<TbWallet aria-hidden />}
              flat
              className="h-9"
            />
          </GreyAccountSelect>
        </div>
      </ActionStep>

      {hasExtraIdToReceive && (
        <Fragment>
          <Separator />

          <ActionStep
            title={
              <div className="flex items-center gap-2">
                <p>{t('extraIdToReceive')}</p>

                <IconButton
                  aria-label={t('openAboutExtraIdToReceiveModal')}
                  colorSchema="neon"
                  type="button"
                  compacted
                  icon={<TbHelp aria-hidden className="min-size-5 max-size-5 size-5" />}
                  onClick={modalNavigateWrapper('about-extra-id-to-receive')}
                />
              </div>
            }
            leftIcon={<VscCircleFilled aria-hidden className="max-size-2 min-size-2 size-2 text-gray-300" />}
          >
            <Input
              aria-label={t('extraIdToReceive')}
              placeholder={t('extraIdToReceivePlaceholder')}
              compacted
              className="text-center"
              contentClassName="px-4 h-9"
              containerClassName="w-42"
              value={state.extraId.value || ''}
              onChange={handleChangeExtraIdToReceive}
              disabled={disabled}
            />
          </ActionStep>
        </Fragment>
      )}
    </div>
  )
}
