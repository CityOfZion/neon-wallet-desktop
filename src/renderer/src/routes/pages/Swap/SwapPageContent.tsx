import { ChangeEvent, Fragment, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdContentPasteGo, MdInfoOutline, MdRestartAlt } from 'react-icons/md'
import { TbCoin, TbDiamond, TbHelp, TbReplace, TbUsers, TbWallet, TbWand } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import {
  isCalculableFee,
  SwapServiceLoadableValue,
  SwapServiceMinMaxAmount,
  SwapServiceToken,
  SwapServiceValidateValue,
} from '@cityofzion/blockchain-service'
import { SimpleSwapService } from '@cityofzion/bs-swap'
import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { GreyAmountInput } from '@renderer/components/GreyAmountInput'
import { GreyTokenSelect } from '@renderer/components/GreyTokenSelect'
import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'
import { TransactionFeeActionStep } from '@renderer/components/TransactionFeeActionStep'
import { SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID } from '@renderer/constants/swap'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useHasContactsByBlockchain } from '@renderer/hooks/useContactSelector'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useIsFocused } from '@renderer/hooks/useIsFocused'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { bsAggregator, doesBlockchainSupported } from '@renderer/libs/blockchainService'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState, TContactAddress, TSwapRecord } from '@shared/@types/store'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

type TActionsData = {
  availableTokensToUse: SwapServiceLoadableValue<SwapServiceToken<TBlockchainServiceKey>[]>
  selectedTokenToUse: SwapServiceLoadableValue<SwapServiceToken<TBlockchainServiceKey>>
  selectedAccountToUse: SwapServiceValidateValue<IAccountState>
  selectedAmountToUse: SwapServiceLoadableValue<string>
  availableTokensToReceive: SwapServiceLoadableValue<SwapServiceToken<TBlockchainServiceKey>[]>
  selectedTokenToReceive: SwapServiceLoadableValue<SwapServiceToken<TBlockchainServiceKey>>
  selectedAmountToReceive: SwapServiceLoadableValue<string>
  selectedAddressToReceive: SwapServiceValidateValue<string>
  selectedExtraIdToReceive: SwapServiceValidateValue<string>
  selectAmountToUseMinMax: SwapServiceLoadableValue<SwapServiceMinMaxAmount>
  fee?: string
  isCalculatingFee: boolean
}

type TProps = {
  account?: IAccountState
}

export const SwapPageContent = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'swap' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper, modalNavigate } = useModalNavigate()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { accountsRef } = useAccountsSelector()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const dispatch = useAppDispatch()
  const pressOncePasteAddressToReceive = usePressOnce()
  const { ref: amountInputRef, isFocused: isAmountInputFocused } = useIsFocused<HTMLInputElement>()

  const swapChainsByServiceName = useMemo(() => {
    const chainsByServiceName: Partial<Record<TBlockchainServiceKey, string[]>> = {}

    for (const networkBlockchain in networkByBlockchain) {
      const blockchain = networkBlockchain as TBlockchainServiceKey
      const network = networkByBlockchain[blockchain]
      const swapNetwork = SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID[blockchain][network.id]

      if (swapNetwork) {
        chainsByServiceName[blockchain] = swapNetwork
      }
    }

    return chainsByServiceName
  }, [networkByBlockchain])

  const swapServiceRef = useRef<SimpleSwapService<TBlockchainServiceKey>>()

  const { actionData, actionState, setData, setError, clearErrors, reset, handleAct } = useActions<TActionsData>(
    {
      availableTokensToUse: { loading: true, value: [] },
      selectedTokenToUse: { loading: false, value: null },
      selectedAccountToUse: { loading: false, value: null, valid: null },
      selectedAmountToUse: { loading: false, value: null },
      availableTokensToReceive: { loading: false, value: [] },
      selectedTokenToReceive: { loading: false, value: null },
      selectedAmountToReceive: { loading: false, value: null },
      selectedAddressToReceive: { loading: false, value: null, valid: null },
      selectedExtraIdToReceive: { loading: false, value: null, valid: null },
      selectAmountToUseMinMax: { loading: false, value: null },
      fee: undefined,
      isCalculatingFee: false,
    },
    { clearErrorsOnChange: false }
  )

  const tokenToReceiveBlockchain = actionData.selectedTokenToReceive.value?.blockchain

  const { hasContactsByBlockchain } = useHasContactsByBlockchain(tokenToReceiveBlockchain)

  const isRestartDisabled = actionData.availableTokensToUse.loading || actionState.hasChanged

  const isAddressesDisabled =
    !actionData.selectedTokenToUse.value ||
    !actionData.selectedTokenToReceive.value ||
    actionData.availableTokensToReceive.loading ||
    actionData.availableTokensToUse.loading ||
    actionData.selectedTokenToUse.loading

  const isAmountsDisabled =
    isAddressesDisabled ||
    !actionData.selectedAccountToUse.value ||
    actionData.selectedAccountToUse.valid === false ||
    !actionData.selectedAddressToReceive.value ||
    actionData.selectedAddressToReceive.valid === false

  const isContactsAndAccountsSelectionDisabled = tokenToReceiveBlockchain
    ? !doesBlockchainSupported(tokenToReceiveBlockchain) || !actionData.selectedAccountToUse.value
    : true

  const isAccountsSelectionDisabled = !tokenToReceiveBlockchain
    ? true
    : isContactsAndAccountsSelectionDisabled ||
      !accountsRef.current.some(({ blockchain }) => blockchain === tokenToReceiveBlockchain)

  const hasExtraIdToReceive = !!actionData.selectedTokenToReceive.value?.hasExtraId

  const isExtraIdToReceiveInvalid =
    hasExtraIdToReceive &&
    (!actionData.selectedExtraIdToReceive.valid || !actionData.selectedExtraIdToReceive.value?.trim())

  const isExtraIdToReceiveWrong = hasExtraIdToReceive && actionData.selectedExtraIdToReceive.valid === false

  const balanceQuery = useBalance(actionData.selectedAccountToUse.value ?? undefined)

  const errorMessage = useMemo(() => {
    const message = actionState.errors.selectedAmountToUse ?? actionState.errors.fee ?? ''

    if (message) return message
    if (isExtraIdToReceiveWrong) return t('form.errors.invalidExtraIdToReceive') as string

    return message

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState, isExtraIdToReceiveWrong])

  const service = useMemo(
    () =>
      actionData.selectedAccountToUse.value
        ? bsAggregator.blockchainServicesByName[actionData.selectedAccountToUse.value.blockchain]
        : undefined,
    [actionData.selectedAccountToUse.value]
  )

  const selectedTokenBalance = useMemo(() => {
    if (!service || !balanceQuery.data || !actionData.selectedTokenToUse.value) return

    const tokenHash = UtilsHelper.normalizeHash(actionData.selectedTokenToUse.value!.hash!)

    return balanceQuery.data?.tokensBalances.find(
      tokenBalance => UtilsHelper.normalizeHash(tokenBalance.token.hash) === tokenHash
    )
  }, [actionData.selectedTokenToUse.value, balanceQuery.data, service])

  const initializeOrRestartSwapService = () => {
    reset()

    const swapService = new SimpleSwapService({
      blockchainServicesByName: bsAggregator.blockchainServicesByName,
      chainsByServiceName: swapChainsByServiceName,
    })

    swapService.eventEmitter.on('availableTokensToUse', availableTokensToUse => {
      if (!availableTokensToUse.value) availableTokensToUse.value = []

      setData({ availableTokensToUse })
    })

    swapService.eventEmitter.on('tokenToUse', tokenToUse => {
      setData({ selectedTokenToUse: tokenToUse })
    })

    swapService.eventEmitter.on('accountToUse', accountToUse => {
      const account = accountToUse.value
        ? accountsRef.current.find(SharedAccountHelper.predicate(accountToUse.value!))
        : undefined

      setData({ selectedAccountToUse: { ...accountToUse, value: account ?? null } })
    })

    swapService.eventEmitter.on('amountToUse', amountToUse => {
      setData({ selectedAmountToUse: amountToUse })
    })

    swapService.eventEmitter.on('availableTokensToReceive', availableTokensToReceive => {
      if (!availableTokensToReceive.value) availableTokensToReceive.value = []

      setData({ availableTokensToReceive: availableTokensToReceive })
    })

    swapService.eventEmitter.on('tokenToReceive', tokenToReceive => {
      setData({ selectedTokenToReceive: tokenToReceive })
    })

    swapService.eventEmitter.on('amountToReceive', amountToReceive => {
      setData({ selectedAmountToReceive: amountToReceive })
    })

    swapService.eventEmitter.on('addressToReceive', addressToReceive => {
      setData({ selectedAddressToReceive: addressToReceive })
    })

    swapService.eventEmitter.on('extraIdToReceive', selectedExtraIdToReceive => {
      setData({ selectedExtraIdToReceive })
    })

    swapService.eventEmitter.on('amountToUseMinMax', amountToUseMinMax => {
      setData({ selectAmountToUseMinMax: amountToUseMinMax })
    })

    swapService.eventEmitter.on('error', error => {
      ToastHelper.error({ message: error, duration: 6000 })
    })

    swapServiceRef.current = swapService

    swapService.init()
  }

  const removeSwapServiceListeners = () => {
    swapServiceRef.current?.eventEmitter.removeAllListeners()
  }

  const handleSelectTokenToUse = (token: SwapServiceToken<TBlockchainServiceKey>) => {
    swapServiceRef.current?.setAmountToUse(null)
    swapServiceRef.current?.setTokenToUse(token)
  }

  const handleSelectTokenToReceive = (token: SwapServiceToken<TBlockchainServiceKey>) => {
    swapServiceRef.current?.setTokenToReceive(token)
  }

  const handleSelectAccountToUse = async (account: IAccountState) => {
    if (!currentLoginSessionRef.current || !account.encryptedKey) return

    const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
      value: account.encryptedKey,
      encryptedSecret: currentLoginSessionRef.current.encryptedPassword,
    })

    const serviceAccount = AccountHelper.getServiceAccount({ account, key })

    swapServiceRef.current?.setAccountToUse(serviceAccount)
  }

  const handleSelectContactToReceive = (address: TContactAddress) => {
    swapServiceRef.current?.setAddressToReceive(address.address)
  }

  const handleSelectAccountToReceive = (account: IAccountState) => {
    swapServiceRef.current?.setAddressToReceive(account.address)
  }

  const handleChangeAddressToReceive = (event: ChangeEvent<HTMLInputElement>) => {
    swapServiceRef.current?.setAddressToReceive(
      UtilsHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })
    )
  }

  const handleChangeExtraIdToReceive = (event: ChangeEvent<HTMLInputElement>) => {
    swapServiceRef.current?.setExtraIdToReceive(event.target.value)
  }

  const handlePasteAddressToReceive = async () => {
    try {
      const text = await navigator.clipboard.readText()

      await swapServiceRef.current!.setAddressToReceive(text)
    } catch (error) {
      ToastHelper.error({ message: tCommonGeneral('pasteFromClipboardError') })
      console.error(error)
    }
  }

  const handleChangeAmountToUse = (value: string) => {
    try {
      const amount = NumberHelper.formatString(value, {
        decimals: actionData.selectedTokenToUse.value?.decimals,
        max: 24,
        removeTrailingZero: false,
        throwWhenNaN: true,
      })

      swapServiceRef.current?.setAmountToUse(amount)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async () => {
    const account = actionData.selectedAccountToUse.value

    if (
      !swapServiceRef.current ||
      !service ||
      !actionData.selectedTokenToUse.value ||
      !actionData.selectedTokenToUse.value.hash ||
      actionData.selectedTokenToUse.value.decimals === undefined ||
      !actionData.selectedTokenToReceive.value ||
      !actionData.selectedAmountToUse.value ||
      !actionData.selectedAmountToReceive.value ||
      !account ||
      !actionData.selectedAddressToReceive.value ||
      !actionData.selectedAddressToReceive.valid ||
      !actionData.selectAmountToUseMinMax.value ||
      isExtraIdToReceiveInvalid
    )
      return

    if (account.type === 'hardware') {
      const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(account)

      if (!isConnectedAndUnlocked) {
        const message = t('form.errors.hardwareWalletNotConnectedOrLocked')

        ToastHelper.error({ message, duration: 8000 })

        throw new Error(message)
      }
    }

    const swapRecord: TSwapRecord = {
      account,
      addressTo: actionData.selectedAddressToReceive.value,
      extraIdTo: actionData.selectedExtraIdToReceive.value ?? undefined,
      amountFrom: actionData.selectedAmountToUse.value,
      amountTo: actionData.selectedAmountToReceive.value,
      tokenFrom: actionData.selectedTokenToUse.value,
      tokenTo: actionData.selectedTokenToReceive.value,
      swapStatus: 'confirming',
      swapProvider: 'simpleswap',
      fee: actionData.fee,
    }

    try {
      const swapResponse = await swapServiceRef.current.swap()

      swapRecord.swapId = swapResponse.id
      swapRecord.txFrom = swapResponse.txFrom
      swapRecord.log = swapResponse.log
    } catch (error: any) {
      console.error(error)
    } finally {
      if (!swapRecord.txFrom) swapRecord.swapStatus = 'refunded'

      dispatch(utilityReducerActions.persistSwapRecord(swapRecord))

      modalNavigate('swap-details', {
        state: {
          swapRecord,
        },
      })

      initializeOrRestartSwapService()
    }
  }

  useEffect(() => {
    if (balanceQuery.isLoading) return

    const handleCalculateFee = async () => {
      try {
        if (
          !swapServiceRef.current ||
          !service ||
          !actionData.selectedTokenToUse.value ||
          !actionData.selectedTokenToUse.value.hash ||
          !actionData.selectedTokenToUse.value.decimals === undefined ||
          !actionData.selectedTokenToReceive.value ||
          !actionData.selectedAmountToUse.value ||
          !actionData.selectedAmountToReceive.value ||
          !actionData.selectedAccountToUse.value ||
          !actionData.selectedAddressToReceive.value ||
          !actionData.selectedAddressToReceive.valid ||
          !actionData.selectAmountToUseMinMax.value ||
          !selectedTokenBalance
        ) {
          setData({ fee: undefined })
          return
        }

        setData({ isCalculatingFee: true })

        const fee = await swapServiceRef.current.calculateFee()

        setData({ fee })

        let totalFeeAmount = NumberHelper.number(fee)

        if (
          UtilsHelper.normalizeHash(actionData.selectedTokenToUse.value?.hash) ===
          UtilsHelper.normalizeHash(service.feeToken.hash)
        ) {
          totalFeeAmount += NumberHelper.number(actionData.selectedAmountToUse.value)
        }

        const feeBalanceNumber =
          balanceQuery.data?.tokensBalances.find(
            ({ token }) => UtilsHelper.normalizeHash(token.hash) === UtilsHelper.normalizeHash(service.feeToken.hash)
          )?.amountNumber ?? 0

        if (totalFeeAmount > feeBalanceNumber) {
          setError('fee', t('form.errors.insufficientFundsFee'))
        } else {
          clearErrors('fee')
        }
      } catch {
        setError('fee', t('form.errors.insufficientFundsFee'))
      } finally {
        setData({ isCalculatingFee: false })
      }
    }

    handleCalculateFee()
  }, [
    actionData.selectAmountToUseMinMax.value,
    actionData.selectedAccountToUse.value,
    actionData.selectedAddressToReceive.valid,
    actionData.selectedAddressToReceive.value,
    actionData.selectedAmountToReceive.value,
    actionData.selectedAmountToUse.value,
    actionData.selectedTokenToReceive.value,
    actionData.selectedTokenToUse.value,
    balanceQuery.data?.tokensBalances,
    balanceQuery.isLoading,
    clearErrors,
    selectedTokenBalance,
    service,
    setData,
    setError,
    t,
  ])

  useEffect(() => {
    const validateAmount = () => {
      if (!actionData.selectedAmountToUse.value) {
        clearErrors('selectedAmountToUse')
        return
      }

      try {
        const amountNumber = NumberHelper.number(actionData.selectedAmountToUse.value)

        if (actionData.selectAmountToUseMinMax.value) {
          const minNumber = NumberHelper.number(actionData.selectAmountToUseMinMax.value?.min ?? 0)

          if (amountNumber < minNumber) {
            throw new Error(t('form.errors.amountMin', { amount: minNumber }))
          }

          if (actionData.selectAmountToUseMinMax.value?.max) {
            const maxNumber = NumberHelper.number(actionData.selectAmountToUseMinMax.value.max)

            if (amountNumber > maxNumber) {
              throw new Error(t('form.errors.amountMax', { amount: actionData.selectAmountToUseMinMax.value.max }))
            }
          }
        }

        if (
          actionData.selectedAccountToUse.value &&
          actionData.selectedTokenToUse.value &&
          (!selectedTokenBalance || selectedTokenBalance.amountNumber < amountNumber)
        ) {
          throw new Error(t('form.errors.insufficientFunds'))
        }

        clearErrors('selectedAmountToUse')
      } catch (error: any) {
        setError('selectedAmountToUse', error.message)
      }
    }

    validateAmount()
  }, [
    actionData.selectAmountToUseMinMax.value,
    actionData.selectedAccountToUse.value,
    actionData.selectedAmountToUse.value,
    actionData.selectedTokenToUse.value,
    clearErrors,
    selectedTokenBalance,
    setError,
    t,
  ])

  useLayoutEffect(() => {
    if (!account) return

    handleSelectAccountToUse(account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  useEffect(() => {
    initializeOrRestartSwapService()

    return () => {
      removeSwapServiceListeners()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="flex min-h-0 flex-grow rounded bg-gray-800">
      <div className="flex w-72 flex-col border-r border-gray-300/15 bg-gray-900/50 px-4">
        <div className="flex items-center gap-2.5">
          <MdInfoOutline className="h-6 w-6 text-green" />
          <h2 className="my-3 text-sm text-white">{t('explanation.title')}</h2>
        </div>

        <Separator />

        <div className="mb-6 mt-7 flex flex-grow flex-col items-center justify-between">
          <div className="flex flex-col gap-4 text-xs text-white">
            <p className="font-bold">{t('explanation.description1')}</p>

            <p>{t('explanation.description2')}</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-grow flex-col items-center px-4 text-sm">
        <div className="flex w-full items-center justify-between gap-2 py-3">
          <h2 className="w-full text-sm text-white">{t('form.title')}</h2>

          <Button
            label={t('form.restart')}
            variant="text-slim"
            colorSchema={isRestartDisabled ? 'gray' : 'neon'}
            disabled={isRestartDisabled}
            leftIcon={<MdRestartAlt aria-hidden={true} />}
            onClick={initializeOrRestartSwapService}
          />
        </div>

        <Separator />

        <div className="flex min-h-0 w-full flex-grow flex-col items-center overflow-auto py-2">
          <div className="mx-auto flex w-full max-w-[36rem] flex-col items-center px-4 pb-8 pt-2">
            <div className="flex w-full flex-col items-center rounded bg-gray-700/60 px-4">
              <ActionStep
                title={t('form.assets')}
                leftIcon={<TbDiamond aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
                className="font-bold"
                titleClassName="text-md"
                headerClassName="gap-4"
              />

              <Separator />

              <ActionStep
                title={t('form.tokenToUseTitle')}
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                headerClassName="gap-4"
              >
                <GreyTokenSelect
                  tokens={actionData.availableTokensToUse.value ?? []}
                  loading={actionData.availableTokensToUse.loading || actionData.selectedTokenToUse.loading}
                  onSelect={handleSelectTokenToUse}
                  selectedToken={actionData.selectedTokenToUse.value ?? undefined}
                  balance={balanceQuery.data}
                  blockchain={actionData.selectedAccountToUse.value?.blockchain}
                />
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.tokenToReceiveTitle')}
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                className="mb-2"
                headerClassName="gap-4"
              >
                <GreyTokenSelect
                  tokens={actionData.availableTokensToReceive.value ?? []}
                  loading={actionData.availableTokensToReceive.loading}
                  onSelect={handleSelectTokenToReceive}
                  selectedToken={actionData.selectedTokenToReceive.value ?? undefined}
                  disabled={!actionData.selectedTokenToUse.value}
                />
              </ActionStep>
            </div>

            <ActionStepSeparator />

            <div className="mt-2.5 flex w-full flex-col items-center rounded bg-gray-700/60 px-4 pb-4">
              <ActionStep
                title={t('form.source')}
                leftIcon={<TbWallet aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
                className="font-bold"
                titleClassName="text-md"
                headerClassName="gap-4"
              />

              <Separator />

              <ActionStep
                title={t('form.accountToUseTitle')}
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                headerClassName="gap-4"
              >
                <GreyAccountSelect
                  selectedAccount={actionData.selectedAccountToUse.value}
                  onSelect={handleSelectAccountToUse}
                  blockchains={
                    actionData.selectedTokenToUse.value?.blockchain
                      ? [actionData.selectedTokenToUse.value.blockchain]
                      : (Object.keys(swapChainsByServiceName) as TBlockchainServiceKey[])
                  }
                  disabled={isAddressesDisabled}
                />
              </ActionStep>

              <Separator />

              <ActionStep
                title={t('form.receiveHere')}
                titleClassName="!whitespace-nowrap !overflow-visible !text-ellipsis"
                className="gap-3"
                headerClassName="gap-4"
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
              >
                <div className="my-3 flex w-full items-start gap-3">
                  <Input
                    value={actionData.selectedAddressToReceive.value ?? ''}
                    onChange={handleChangeAddressToReceive}
                    compacted
                    className="w-full"
                    containerClassName="max-w-[70%] mr-0 ml-auto"
                    contentClassName="px-3 h-9"
                    actionsClassName="gap-x-1"
                    placeholder={t('form.addressToReceivePlaceholder')}
                    clearable={false}
                    rightElement={
                      <Fragment>
                        <IconButton
                          aria-label={tCommonGeneral('pasteFromClipboard')}
                          colorSchema="neon"
                          type="button"
                          compacted
                          disabled={
                            !actionData.selectedAccountToUse.value ||
                            isAddressesDisabled ||
                            pressOncePasteAddressToReceive.isPressing
                          }
                          icon={<MdContentPasteGo aria-hidden={true} className="h-4 min-h-4 w-4 min-w-4" />}
                          onClick={pressOncePasteAddressToReceive.handlePressOnce(handlePasteAddressToReceive)}
                        />

                        <IconButton
                          icon={<TbUsers aria-hidden={true} className="h-4 min-h-4 w-4 min-w-4" />}
                          colorSchema="neon"
                          type="button"
                          onClick={modalNavigateWrapper('select-contact', {
                            state: {
                              onSelectContact: handleSelectContactToReceive,
                              blockchain: tokenToReceiveBlockchain,
                            },
                          })}
                          compacted
                          disabled={isContactsAndAccountsSelectionDisabled || !hasContactsByBlockchain}
                        />
                      </Fragment>
                    }
                    loading={actionData.selectedAddressToReceive.loading}
                    errorMessage={
                      actionData.selectedAddressToReceive.valid === false ? t('form.errors.invalidAddress') : undefined
                    }
                    hint={
                      actionData.selectedTokenToReceive.value &&
                      actionData.selectedAccountToUse.value &&
                      isContactsAndAccountsSelectionDisabled
                        ? t('form.hints.enterValidAddress')
                        : undefined
                    }
                    disabled={!actionData.selectedAccountToUse.value || isAddressesDisabled}
                  />

                  <GreyAccountSelect
                    withoutIndicator
                    blockchains={tokenToReceiveBlockchain ? [tokenToReceiveBlockchain] : undefined}
                    disabled={isAccountsSelectionDisabled}
                    onSelect={handleSelectAccountToReceive}
                  >
                    <Button
                      className={StyleHelper.mergeStyles('h-9', {
                        'opacity-40': isAccountsSelectionDisabled,
                      })}
                      clickableProps={{ className: 'px-3 text-neon' }}
                      disabled={isAccountsSelectionDisabled}
                      colorSchema="neon"
                      variant="card"
                      label={t('form.myAccountsButtonLabel')}
                      flat
                    />
                  </GreyAccountSelect>
                </div>
              </ActionStep>

              {hasExtraIdToReceive && (
                <>
                  <Separator />

                  <ActionStep
                    headerClassName="gap-4"
                    title={
                      <div className="flex items-center gap-2">
                        <p>{t('form.extraIdToReceive')}</p>

                        <IconButton
                          aria-label={t('form.openAboutExtraIdToReceiveModal')}
                          colorSchema="neon"
                          type="button"
                          compacted
                          icon={<TbHelp aria-hidden={true} className="h-5 min-h-5 w-5 min-w-5" />}
                          onClick={modalNavigateWrapper('about-extra-id-to-receive')}
                        />
                      </div>
                    }
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                  >
                    <Input
                      aria-label={t('form.extraIdToReceive')}
                      placeholder={t('form.extraIdToReceivePlaceholder')}
                      compacted
                      className="text-center"
                      contentClassName="px-4 h-9"
                      containerClassName="w-42"
                      error={actionData.selectedExtraIdToReceive.valid === false}
                      value={actionData.selectedExtraIdToReceive.value ?? ''}
                      required={true}
                      disabled={!actionData.selectedAccountToUse.value || isAddressesDisabled}
                      onChange={handleChangeExtraIdToReceive}
                    />
                  </ActionStep>
                </>
              )}
            </div>

            <ActionStepSeparator />

            <div className="mt-2.5 flex w-full flex-col items-center rounded bg-gray-700/60 px-4">
              <ActionStep
                title={t('form.amounts')}
                className="font-bold"
                titleClassName="text-md"
                headerClassName="gap-4"
                leftIcon={<TbCoin aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
              />

              <Separator />

              <ActionStep
                title={t('form.amountToUseTitle')}
                headerClassName="gap-4"
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-200">
                    {t('form.minimumAmountToUseLabel', {
                      amount:
                        actionData.selectAmountToUseMinMax.value?.min?.slice(0, 24) ??
                        t('form.minimumAmountToUsePlaceholder'),
                    })}
                  </span>
                  <Tooltip
                    title={t('form.tooltipTitle')}
                    icon={<TbWand aria-hidden className="h-6 w-6 text-blue" />}
                    open={isAmountInputFocused}
                    contentProps={{ side: 'top', className: 'text-center' }}
                  >
                    <GreyAmountInput
                      ref={amountInputRef}
                      value={actionData.selectedAmountToUse.value ?? ''}
                      onChange={handleChangeAmountToUse}
                      disabled={isAmountsDisabled}
                      loading={actionData.selectedAmountToUse.loading}
                    />
                  </Tooltip>
                </div>
              </ActionStep>

              <div className="flex w-full justify-between pb-4 pl-9">
                <span className="text-xs italic text-gray-200">{t('form.balanceLabel')}</span>
                <span className="text-xs italic text-gray-100">
                  {selectedTokenBalance?.amount ?? t('form.balancePlaceholder')}
                </span>
              </div>

              <Separator />

              <ActionStep
                title={
                  <Fragment>
                    {t('form.amountToReceiveTitle')}
                    <span className="text-gray-100">{` ${t('form.amountToReceiveTitleComplement')}`}</span>
                  </Fragment>
                }
                leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-300" />}
                headerClassName="gap-4"
              >
                <GreyAmountInput
                  disabled={isAmountsDisabled}
                  readOnly
                  className="bg-transparent"
                  inputClassName="px-0"
                  value={actionData.selectedAmountToReceive.value ?? ''}
                  loading={actionData.selectedAmountToReceive.loading}
                />
              </ActionStep>
            </div>

            {errorMessage && <AlertErrorBanner className="mt-2.5 w-full" message={errorMessage} />}

            {(!service || (service && isCalculableFee(service))) && (
              <TransactionFeeActionStep
                fee={actionData.fee}
                isCalculatingFee={actionData.isCalculatingFee}
                service={service}
                className="mt-2.5"
              />
            )}

            <Button
              className="mt-8 w-full max-w-[20rem]"
              iconsOnEdge={false}
              onClick={handleAct(handleSubmit)}
              label={t('form.submitLabel')}
              loading={actionState.isActing}
              leftIcon={<TbReplace aria-hidden={true} />}
              disabled={
                !actionState.isValid ||
                !actionData.selectAmountToUseMinMax.value ||
                !actionData.selectedAmountToUse.value ||
                !actionData.selectedAmountToReceive.value ||
                !actionData.selectedTokenToUse.value ||
                !actionData.selectedTokenToReceive.value ||
                !actionData.selectedAccountToUse.value ||
                !actionData.selectedAddressToReceive.value ||
                isExtraIdToReceiveInvalid ||
                !service ||
                (isCalculableFee(service) && !actionData.fee)
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
