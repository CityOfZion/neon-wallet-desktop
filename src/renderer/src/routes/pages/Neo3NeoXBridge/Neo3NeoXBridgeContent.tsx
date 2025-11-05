import { ChangeEvent, useEffect, useRef } from 'react'

import { TBalanceResponse, TBridgeToken, TBridgeValidateValue, TBridgeValue } from '@cityofzion/blockchain-service'
import { Neo3NeoXBridgeOrchestrator } from '@cityofzion/bs-multichain'
import { BSNeo3 } from '@cityofzion/bs-neo3'
import { BSNeoX } from '@cityofzion/bs-neox'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useAccountMapSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useLazyBalance } from '@renderer/hooks/useBalances'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'
import TbArrowsSort from '@renderer/assets/images/tb-arrows-sort.svg?react'
import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbDiamond from '@renderer/assets/images/tb-diamond.svg?react'
import TbLock from '@renderer/assets/images/tb-lock.svg?react'
import TbReplace2 from '@renderer/assets/images/tb-replace-2.svg?react'
import TbUsers from '@renderer/assets/images/tb-users.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'

import { bsAggregator } from '@renderer/libs/blockchain-service'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import { IAccountState, TContactAddress } from '@shared/types/store'

type TProps = {
  account?: IAccountState
}

type TActionsData = {
  availableTokensToUse: TBridgeValue<TBridgeToken<TBlockchainServiceKey>[]>
  tokenToUse: TBridgeValue<TBridgeToken<TBlockchainServiceKey>>
  tokenToUseBalance: TBridgeValue<TBalanceResponse | undefined>
  accountToUse: TBridgeValue<IAccountState>
  amountToUse: TBridgeValidateValue<string>
  amountToUseMin: TBridgeValue<string>
  amountToUseMax: TBridgeValue<string>
  tokenToReceive: TBridgeValue<TBridgeToken<TBlockchainServiceKey>>
  addressToReceive: TBridgeValidateValue<string>
  amountToReceive: TBridgeValue<string>
  bridgeFee: TBridgeValue<string>
}

const isBridgeValueValid = (value: TBridgeValue<any> | TBridgeValidateValue<any>): boolean => {
  return value.value && !value.error && !value.loading && ('valid' in value ? value.valid === true : true)
}

export const Neo3NeoXBridgeContent = ({ account }: TProps) => {
  const { t: commonT } = useTranslation('common')
  const { t } = useTranslation('pages', { keyPrefix: 'neo3NeoXBridge' })
  const { accountsMapRef } = useAccountMapSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { getBalance } = useLazyBalance()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const navigate = useNavigate()
  const isGoingBack = useRef(false)

  const { actionData, actionState, setData, reset, handleAct } = useActions<TActionsData>({
    availableTokensToUse: { value: null, error: null, loading: false },
    tokenToUse: { value: null, error: null, loading: false },
    tokenToUseBalance: { value: null, error: null, loading: false },
    accountToUse: { value: null, error: null, loading: false },
    amountToUse: { value: null, valid: null, error: null, loading: false },
    amountToUseMin: { value: null, error: null, loading: false },
    amountToUseMax: { value: null, error: null, loading: false },
    tokenToReceive: { value: null, error: null, loading: false },
    addressToReceive: { value: null, valid: null, error: null, loading: false },
    amountToReceive: { value: null, error: null, loading: false },
    bridgeFee: { value: null, error: null, loading: false },
  })

  const bridgeOrchestratorRef = useRef({} as Neo3NeoXBridgeOrchestrator<TBlockchainServiceKey>)

  const fromService = bridgeOrchestratorRef.current?.fromService

  const isAddressesDisabled =
    !actionData.tokenToUse.value ||
    actionData.tokenToUse.loading ||
    !actionData.tokenToReceive.value ||
    actionData.tokenToReceive.loading ||
    !actionData.availableTokensToUse.value ||
    actionData.availableTokensToUse.loading

  const isAmountsDisabled =
    isAddressesDisabled ||
    !actionData.accountToUse.value ||
    !actionData.addressToReceive.value ||
    actionData.addressToReceive.valid === false

  const isRestartDisabled = actionData.availableTokensToUse.loading || !actionState.hasChanged

  const errorCode =
    actionData.availableTokensToUse.error?.code ||
    actionData.tokenToUseBalance.error?.code ||
    actionData.accountToUse.error?.code ||
    actionData.tokenToUse.error?.code ||
    actionData.tokenToReceive.error?.code ||
    actionData.bridgeFee?.error?.code ||
    actionData.amountToUse.error?.code ||
    actionData.amountToUseMin.error?.code ||
    actionData.amountToUseMax.error?.code ||
    actionData.addressToReceive.error?.code ||
    actionData.amountToReceive.error?.code

  const errorMessage = errorCode ? t(`errorsByCode.${errorCode}`, t('errorsByCode.UNEXPECTED_ERROR')) : undefined

  const isBridgeValid =
    !isAmountsDisabled &&
    isBridgeValueValid(actionData.availableTokensToUse) &&
    isBridgeValueValid(actionData.tokenToUse) &&
    isBridgeValueValid(actionData.tokenToUseBalance) &&
    isBridgeValueValid(actionData.accountToUse) &&
    isBridgeValueValid(actionData.amountToUse) &&
    isBridgeValueValid(actionData.amountToUseMin) &&
    isBridgeValueValid(actionData.amountToUseMax) &&
    isBridgeValueValid(actionData.tokenToReceive) &&
    isBridgeValueValid(actionData.addressToReceive) &&
    isBridgeValueValid(actionData.amountToReceive) &&
    isBridgeValueValid(actionData.bridgeFee)

  const initializeOrRestartSwapService = async () => {
    reset()

    const neo3NeoXBridgeOrchestrator = new Neo3NeoXBridgeOrchestrator<TBlockchainServiceKey>({
      neo3Service: bsAggregator.blockchainServicesByName.neo3 as BSNeo3<TBlockchainServiceKey>,
      neoXService: bsAggregator.blockchainServicesByName.neox as BSNeoX<TBlockchainServiceKey>,
      initialFromServiceName: account?.blockchain,
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('availableTokensToUse', availableTokensToUse => {
      setData({ availableTokensToUse })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('tokenToUse', tokenToUse => {
      setData({ tokenToUse })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('tokenToUseBalance', tokenToUseBalance => {
      setData({ tokenToUseBalance })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('accountToUse', accountToUse => {
      const account = accountToUse.value
        ? accountsMapRef.current.get(SharedAccountHelper.buildAccountKey(accountToUse.value))
        : undefined

      setData({ accountToUse: { ...accountToUse, value: account ?? null } })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('amountToUse', amountToUse => {
      setData({ amountToUse })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('amountToUseMin', amountToUseMin => {
      setData({ amountToUseMin })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('amountToUseMax', amountToUseMax => {
      setData({ amountToUseMax })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('tokenToReceive', tokenToReceive => {
      setData({ tokenToReceive })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('addressToReceive', addressToReceive => {
      setData({ addressToReceive })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('amountToReceive', amountToReceive => {
      setData({ amountToReceive })
    })

    neo3NeoXBridgeOrchestrator.eventEmitter.on('bridgeFee', bridgeFee => {
      setData({ bridgeFee })
    })
    await neo3NeoXBridgeOrchestrator.init()

    bridgeOrchestratorRef.current = neo3NeoXBridgeOrchestrator

    if (account) {
      await handleSelectAccountToUse(account)
    }
  }

  const handleSelectTokenToUse = async (token: TBridgeToken<TBlockchainServiceKey>) => {
    await bridgeOrchestratorRef.current.setTokenToUse(token)
  }

  const handleSwitchTokens = async () => {
    await bridgeOrchestratorRef.current.switchTokens()
  }

  const handleSelectAccountToUse = async (account: IAccountState) => {
    if (!currentLoginSessionRef.current || !account.encryptedKey) return

    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account, key })

    await bridgeOrchestratorRef.current.setAccountToUse(serviceAccount)

    const data = await getBalance({ address: account.address, blockchain: account.blockchain })

    await bridgeOrchestratorRef.current.setBalances(data.tokensBalances)
  }

  const handleChangeAddressToReceive = (event: ChangeEvent<HTMLInputElement>) => {
    bridgeOrchestratorRef.current.setAddressToReceive(
      UtilsHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })
    )
  }

  const handleSelectContactToReceive = (contactAddress: TContactAddress) => {
    bridgeOrchestratorRef.current.setAddressToReceive(contactAddress.address)
  }

  const handleSelectAccountToReceive = (account: IAccountState) => {
    bridgeOrchestratorRef.current.setAddressToReceive(account.address)
  }

  const handleChangeAmountToUse = (value: string) => {
    bridgeOrchestratorRef.current.setAmountToUse(value)
  }

  const handleClickMaxAmountToUse = () => {
    if (!actionData.amountToUseMax.value) return
    bridgeOrchestratorRef.current.setAmountToUse(actionData.amountToUseMax.value)
  }

  const handleSubmit = async () => {
    if (!isBridgeValid) return

    modalNavigate('neo3-neox-bridge-confirmation', {
      state: {
        tokenToUse: actionData.tokenToUse.value,
        tokenToReceive: actionData.tokenToReceive.value,
        accountToUse: actionData.accountToUse.value,
        addressToReceive: actionData.addressToReceive.value,
        amountToUse: actionData.amountToUse.value,
        amountToReceive: actionData.amountToReceive.value,
        bridgeFee: actionData.bridgeFee.value,
        fromService,
        onConfirm: async () => {
          const account = actionData.accountToUse.value!

          if (account.type === 'hardware') {
            const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(account)

            if (!isConnectedAndUnlocked) {
              const message = commonT('errors.hardwareWalletNotConnectedOrLocked')
              ToastHelper.error({ message, duration: 8000 })
              throw new Error(message)
            }
          }

          let transactionHash: string | undefined

          try {
            transactionHash = await bridgeOrchestratorRef.current.bridge()
          } catch (error: any) {
            console.error(error)
          } finally {
            modalNavigate('neo3-neox-bridge-details', {
              replace: true,
              state: {
                tokenToUse: actionData.tokenToUse.value,
                tokenToReceive: actionData.tokenToReceive.value,
                accountToUse: actionData.accountToUse.value,
                addressToReceive: actionData.addressToReceive.value,
                amountToUse: actionData.amountToUse.value,
                amountToReceive: actionData.amountToReceive.value,
                transactionHash,
                confirmed: !transactionHash ? false : undefined,
              },
            })

            initializeOrRestartSwapService()
          }
        },
      },
    })
  }

  useMountUnsafe(() => {
    initializeOrRestartSwapService()

    return () => {
      bridgeOrchestratorRef.current?.eventEmitter?.removeAllListeners()
    }
  })

  useEffect(() => {
    if (isGoingBack.current) return
    if (networkByBlockchain.neo3.type === 'mainnet' && networkByBlockchain.neox.type === 'mainnet') return

    isGoingBack.current = true

    ToastHelper.info({
      id: 'bridge-neo3-neox-mainnet-info',
      message: t('messages.networksShouldBeMainnet'),
      duration: 8000,
    })

    navigate(-1)
  }, [navigate, networkByBlockchain, t])

  return (
    <section className="flex h-full w-full rounded-sm bg-gray-800">
      <div className="flex w-72 max-w-72 min-w-72 flex-col border-r border-gray-300/15 bg-gray-900/50 px-4 pt-1 pb-6">
        <div className="flex h-12 items-center gap-x-2">
          <MdInfoOutline aria-hidden className="text-green h-6 w-6" />
          <h2 className="text-sm text-white">{t('explanation.title')}</h2>
        </div>

        <Separator />

        <p className="mt-8 text-xs font-bold text-white">{t('explanation.description1')}</p>
        <p className="mt-6 text-xs text-white">{t('explanation.description2')}</p>
        <p className="mt-6 grow text-xs text-white italic">{t('explanation.description3')}</p>
        <Banner type="warningOrange" message={t('explanation.alert')} className="mt-12" textClassName="py-3" />
      </div>

      <div className="flex h-full w-full flex-col px-4 pt-1">
        <div className="flex justify-between">
          <h2 className="flex h-12 w-full items-center text-sm text-white">{t('form.title')}</h2>
          <Button
            variant="text"
            flat
            label={t('form.restartButtonLabel')}
            leftIcon={<MdRestartAlt aria-hidden />}
            colorSchema={isRestartDisabled ? 'gray' : 'neon'}
            disabled={isRestartDisabled}
            onClick={initializeOrRestartSwapService}
          />
        </div>

        <Separator />

        <div className="flex min-h-0 w-full grow flex-col items-center overflow-auto py-2">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 pt-2 pb-8">
            <div className="flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4">
              <ActionStep
                title={t('form.assetsStepTitle')}
                leftIcon={<TbDiamond aria-hidden />}
                className="font-bold"
              />

              <Separator />

              <ActionStep
                title={t('form.tokenToUseStepTitle')}
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <GreyTokenSelect
                  tokens={actionData.availableTokensToUse.value ?? []}
                  loading={actionData.availableTokensToUse.loading || actionData.tokenToUse.loading}
                  onSelect={handleSelectTokenToUse}
                  selectedToken={actionData.tokenToUse.value ?? undefined}
                />
              </ActionStep>

              <div className="relative z-10 w-full">
                <IconButton
                  aria-label={t('form.switchTokensButtonLabel')}
                  variant="contained"
                  onClick={handleSwitchTokens}
                  colorSchema="neon"
                  compacted
                  rounded
                  size="sm"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  icon={<TbArrowsSort aria-hidden />}
                />

                <Separator />
              </div>

              <ActionStep
                title={t('form.tokenToReceiveStepTitle')}
                leftIcon={<TbLock aria-hidden className="text-gray-300" />}
              >
                <GreyTokenSelect
                  disabled
                  tokens={[]}
                  loading={actionData.tokenToReceive.loading}
                  selectedToken={actionData.tokenToReceive.value ?? undefined}
                />
              </ActionStep>
            </div>

            <ActionStepSeparator />

            <div className="mt-2 flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4 pb-2">
              <ActionStep
                title={t('form.accountDetailsStepTitle')}
                leftIcon={<TbWallet aria-hidden />}
                className="font-bold"
              />

              <Separator />

              <ActionStep
                title={t('form.accountToUseStepTitle')}
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <GreyAccountSelect
                  selectedAccount={actionData.accountToUse.value}
                  onSelect={handleSelectAccountToUse}
                  blockchains={actionData.tokenToUse.value ? [actionData.tokenToUse.value.blockchain] : undefined}
                  disabled={isAddressesDisabled}
                />
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.addressToReceiveStepTitle')}
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <div className="flex grow items-start gap-3">
                  <Input
                    value={actionData.addressToReceive.value ?? ''}
                    onChange={handleChangeAddressToReceive}
                    compacted
                    containerClassName="w-auto grow"
                    placeholder={t('form.addressToReceiveInputPlaceholder')}
                    disabled={isAddressesDisabled || !actionData.tokenToReceive.value}
                    clearable={false}
                    pastable
                    error={!!actionData.addressToReceive.error || actionData.addressToReceive.valid === false}
                    rightElement={
                      <IconButton
                        aria-label={t('form.addressToReceiveContactButtonLabel')}
                        icon={<TbUsers aria-hidden className="h-4 min-h-4 w-4 min-w-4" />}
                        colorSchema="neon"
                        type="button"
                        onClick={modalNavigateWrapper('select-contact', {
                          state: {
                            onSelectContact: handleSelectContactToReceive,
                            blockchain: actionData.tokenToReceive.value?.blockchain,
                          },
                        })}
                        compacted
                        disabled={isAddressesDisabled || !actionData.tokenToReceive.value}
                      />
                    }
                  />

                  <GreyAccountSelect
                    withoutIndicator
                    blockchains={
                      actionData.tokenToReceive.value ? [actionData.tokenToReceive.value.blockchain] : undefined
                    }
                    disabled={!actionData.tokenToReceive.value}
                    onSelect={handleSelectAccountToReceive}
                  >
                    <Button
                      clickableProps={{ className: 'px-3 text-neon' }}
                      colorSchema="neon"
                      variant="card"
                      label={t('form.addressToReceiveMyAccountButtonLabel')}
                      flat
                    />
                  </GreyAccountSelect>
                </div>
              </ActionStep>
            </div>

            <ActionStepSeparator />

            <div className="mt-2 flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-4">
              <ActionStep title={t('form.amountsStepTitle')} leftIcon={<TbCoin aria-hidden />} className="font-bold" />

              <Separator />

              <ActionStep
                title={t('form.amountToUseStepTitle')}
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
                footer={
                  <div className="flex w-full justify-between">
                    <span className="text-xs text-gray-200 italic">{t('form.tokenToUseBalanceStepTitle')}</span>
                    <span className="text-xs text-gray-100 italic">
                      {actionData.tokenToUseBalance.value?.amount ?? t('form.tokenToUseBalancePlaceholder')}
                    </span>
                  </div>
                }
              >
                <div className="flex gap-2.5">
                  <span className="mt-2 text-xs text-gray-200">
                    {t('form.amountToUseMinimumLabel', {
                      amount: actionData.amountToUseMin.value ?? t('form.amountToUseMinimumPlaceholder'),
                    })}
                  </span>

                  <GreyAmountInput
                    value={actionData.amountToUse.value ?? ''}
                    onChangeValue={handleChangeAmountToUse}
                    disabled={isAmountsDisabled}
                    loading={actionData.amountToUse.loading}
                    type="number"
                    error={
                      !!actionData.amountToUse.error ||
                      !!actionData.amountToUseMin.error ||
                      !!actionData.amountToUseMax.error
                    }
                    maxButtonProps={{
                      disabled: !actionData.amountToUseMax.value,
                      loading: actionData.amountToUseMax.loading,
                      onClick: handleClickMaxAmountToUse,
                    }}
                  />
                </div>
              </ActionStep>

              <Separator />

              <ActionStep
                title={
                  <p className="text-sm text-white">
                    <Trans t={t} i18nKey="form.amountToReceiveStepTitle">
                      start
                      <span className="text-gray-100">middle</span>
                      end
                    </Trans>
                  </p>
                }
                leftIcon={<VscCircleFilled aria-hidden className="h-2 w-2 text-gray-300" />}
              >
                <GreyAmountInput
                  readOnly
                  className="text-right"
                  contentClassName="px-0 bg-transparent"
                  disabled={isAmountsDisabled}
                  value={actionData.amountToReceive.value ?? t('form.amountToReceivePlaceholder')}
                  loading={actionData.amountToReceive.loading}
                  error={!!actionData.amountToReceive.error}
                />
              </ActionStep>
            </div>

            {errorMessage && <AlertErrorBanner className="mt-2.5 w-full" message={errorMessage} />}

            <TransactionFeeActionStep
              fee={actionData.bridgeFee?.value ?? undefined}
              isCalculatingFee={actionData.bridgeFee?.loading}
              service={fromService}
              className="mt-2.5"
            />

            <Button
              className="mt-8 w-full max-w-[20rem]"
              iconsOnEdge={false}
              onClick={handleAct(handleSubmit)}
              label={t('form.bridgeButtonLabel')}
              loading={actionState.isActing}
              leftIcon={<TbReplace2 aria-hidden />}
              disabled={!isBridgeValid || actionState.isActing}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
