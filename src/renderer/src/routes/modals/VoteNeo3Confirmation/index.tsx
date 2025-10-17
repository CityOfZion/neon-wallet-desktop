import { Fragment, useMemo } from 'react'

import { BSNeo3, type TVoteServiceCandidate } from '@cityofzion/bs-neo3'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ExchangeHelper } from '@renderer/helpers/ExchangeHelper'
import { NumberHelper } from '@renderer/helpers/NumberHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useExchange } from '@renderer/hooks/useExchange'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import {
  useVoteNeo3CalculateVoteFee,
  useVoteNeo3GetVoteDetailsByAddress,
  useVoteNeo3Validations,
} from '@renderer/hooks/useVoteNeo3'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import TbChartBarPopular from '@renderer/assets/images/tb-chart-bar-popular.svg?react'
import TbCheckbox from '@renderer/assets/images/tb-checkbox.svg?react'

import { NEO3_NEO_TOKEN } from '@renderer/constants/tokens'
import { bsAggregator } from '@renderer/libs/blockchain-service'
import { thunks } from '@renderer/store/thunks'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { IAccountState } from '@shared/@types/store'

import { VoteNeo3ConfirmationSkeleton } from './VoteNeo3ConfirmationSkeleton'

type TLocationState = {
  neo3Account: IAccountState
  candidate: TVoteServiceCandidate
}

const VoteNeo3ConfirmationModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3Confirmation' })
  const { neo3Account, candidate } = useModalState<TLocationState>()
  const voteDetailsByAddressQuery = useVoteNeo3GetVoteDetailsByAddress(neo3Account.address)
  const calculateVoteFeeQuery = useVoteNeo3CalculateVoteFee({ neo3Account, candidatePubKey: candidate.pubKey })
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const { currency } = useCurrencySelector()
  const { modalNavigate } = useModalNavigate()
  const { actionState, handleAct } = useActions({})
  const dispatch = useAppDispatch()

  const service = bsAggregator.blockchainServicesByName.neo3 as BSNeo3
  const fee = calculateVoteFeeQuery.data

  const exchangeQuery = useExchange([{ blockchain: 'neo3', tokens: [service.feeToken] }])
  const balanceQuery = useBalance(neo3Account)
  const { hasEnoughGasToPayFee } = useVoteNeo3Validations({ balanceQuery, gasFee: fee })

  const neoAmount = voteDetailsByAddressQuery.data?.neoBalance ?? 0
  const hasNeoAmount = neoAmount > 0
  const isWatchAccount = neo3Account.type === 'watch'

  const isLoading =
    calculateVoteFeeQuery.isLoading ||
    voteDetailsByAddressQuery.isLoading ||
    balanceQuery.isLoading ||
    exchangeQuery.isLoading

  const isDisabled =
    isLoading ||
    actionState.isActing ||
    !fee ||
    isWatchAccount ||
    voteDetailsByAddressQuery.data?.candidatePubKey === candidate.pubKey ||
    !hasNeoAmount ||
    !hasEnoughGasToPayFee

  const feeFiatPrice = useMemo(
    () => {
      let value = 0

      if (exchangeQuery.data && fee)
        value =
          NumberHelper.number(fee) *
          ExchangeHelper.getExchangeConvertedPrice(service.feeToken.hash, 'neo3', exchangeQuery.data)

      return NumberHelper.currency(value, currency.label, { maximumFractionDigits: 3 })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchangeQuery.data, fee, currency]
  )

  const voteErrorMessage = match({ hasNeoAmount, isWatchAccount, hasEnoughGasToPayFee })
    .with({ hasNeoAmount: false }, () => t('voteErrorMessages.noNeoLabel'))
    .with({ isWatchAccount: true }, () => t('voteErrorMessages.watchAccountLabel'))
    .with({ hasEnoughGasToPayFee: false }, () => t('voteErrorMessages.canNotPayGasFeeLabel'))
    .otherwise(() => undefined)

  const handleSubmit = async () => {
    try {
      if (isDisabled) return

      const key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: neo3Account.encryptedKey!,
        encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
      })

      const account = AccountHelper.getServiceAccount({ account: neo3Account, key })

      if (neo3Account.type === 'hardware') {
        const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(neo3Account)

        if (!isConnectedAndUnlocked) {
          ToastHelper.error({ message: t('messages.invalidHardwareWallet'), duration: 8000 })

          return
        }
      }

      const transactionHash = await service.voteService.vote({
        account,
        candidatePubKey: candidate.pubKey,
      })

      const transaction: TUseTransactionsTransfer = {
        methodName: 'vote',
        account: neo3Account,
        amount: '0',
        asset: NEO3_NEO_TOKEN.symbol,
        assetHash: NEO3_NEO_TOKEN.hash,
        token: NEO3_NEO_TOKEN,
        hash: transactionHash,
        time: DateHelper.getNowUnix(),
        isPending: true,
      }

      dispatch(
        thunks.waitTransaction({
          transaction,
          successNotification: {
            title: 'modals:voteNeo3Confirmation.notifications.voteSuccessNotification.title',
            previewBody: 'modals:voteNeo3Confirmation.notifications.voteSuccessNotification.previewBody',
          },
          failureNotification: {
            title: 'modals:voteNeo3Confirmation.notifications.voteFailureNotification.title',
            previewBody: 'modals:voteNeo3Confirmation.notifications.voteFailureNotification.previewBody',
          },
        })
      )

      modalNavigate('vote-neo3-success', { replace: true, state: { neo3Account, candidate } })
    } catch (error) {
      console.error(error)
      ToastHelper.error({ message: t('messages.voteError'), duration: 8000 })
    }
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headerClassName="pt-3"
      headingIcon={<TbChartBarPopular aria-hidden />}
      className="overflow-y-auto"
      contentClassName="pb-0 px-4 pt-6 my-0 flex flex-col text-sm text-white"
    >
      <div className="flex flex-col gap-y-4">
        <strong className="font-semibold">{t('importanceLabel')}</strong>

        <p>{t('contributeLabel')}</p>

        <strong className="-mb-1 font-semibold text-gray-100 uppercase">{t('detailsLabel')}</strong>

        {isLoading ? (
          <VoteNeo3ConfirmationSkeleton />
        ) : (
          <Fragment>
            <ul className="flex flex-col gap-y-3 rounded-sm bg-gray-700/60 px-4 py-3">
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('accountNameLabel')}</span>
                <span className="w-full max-w-72 truncate">{neo3Account.name}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('addressLabel')}</span>
                <span className="w-full max-w-72 truncate">{neo3Account.address}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('candidateLabel')}</span>
                <span className="w-full max-w-72 truncate">{candidate.name}</span>
              </li>
              <li className="flex items-center gap-x-3 border-b border-gray-300/30 pb-3">
                <span className="text-blue">{t('pubKeyLabel')}</span>
                <Tooltip
                  title={candidate.pubKey}
                  variant="black"
                  delayDuration={0}
                  contentProps={{ className: 'max-w-56' }}
                >
                  <span>{StringHelper.truncateStringMiddle(candidate.pubKey, 28)}</span>
                </Tooltip>
              </li>
              <li className="flex items-center gap-x-3">
                <span className="text-blue">{t('votesLabel')}</span>
                <span className="w-full max-w-72 truncate">
                  {neoAmount} {NEO3_NEO_TOKEN.symbol}
                </span>
              </li>
            </ul>

            <p className="flex gap-x-4 rounded-sm bg-gray-700/60 px-4 py-3 whitespace-nowrap">
              <span className="text-blue">{t('feeLabel')}</span>
              <span className="grow truncate text-right text-gray-100">
                {fee ?? '0'} {service.feeToken.symbol}
              </span>
              <span className="text-gray-300">{feeFiatPrice}</span>
            </p>

            {!!voteErrorMessage && <AlertErrorBanner className="bg-magenta-700 gap-3 p-3" message={voteErrorMessage} />}
          </Fragment>
        )}

        <Button
          label={t('confirmationButtonLabel')}
          className="mx-auto mt-6 mb-8 w-56 max-w-56 min-w-56"
          wide
          disabled={isDisabled}
          loading={actionState.isActing}
          iconsOnEdge={false}
          leftIcon={<TbCheckbox aria-hidden />}
          onClick={handleAct(handleSubmit)}
        />
      </div>
    </CenterModalLayout>
  )
}

export default VoteNeo3ConfirmationModal
