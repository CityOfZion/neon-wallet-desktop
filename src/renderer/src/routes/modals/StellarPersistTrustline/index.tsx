import { BSBigNumber, type TBSToken } from '@cityofzion/blockchain-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { SearchableTokenSelect } from '@renderer/components/SearchableTokenSelect'

import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { TransactionHelper } from '@renderer/helpers/TransactionHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { buildStellarTrustlinesQueryKey, useLazyStellarGetTrustlineTokens } from '@renderer/hooks/useStellarTruslines'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbShieldCheck from '@renderer/assets/images/tb-shield-check.svg?react'

import { thunks } from '@renderer/store/thunks'
import type { TModalState } from '@shared/types/modal'

type TActionsData = {
  token: TBSToken | undefined
  limit: string
}

const StellarPersistTrustlines = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'stellarPersistTrustlines' })
  const { stellarAccount, token, limit } = useModalState<TModalState<'stellar-persist-trustlines'>>()
  const { modalErase } = useModalNavigate()
  const queryClient = useQueryClient()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()
  const { getTrustlinesTokens } = useLazyStellarGetTrustlineTokens()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { actionData, actionState, setDataFromEventWrapper, setData, setError, handleAct } = useActions<TActionsData>({
    token,
    limit: limit ?? '',
  })

  const isEditing = !!token

  const trustlineMutation = useMutation({
    mutationKey: ['stellar-persist-trustline'],
    mutationFn: async () => {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar

      let hasError = false

      const isValidHash = service.tokenService.validateTokenHash(actionData.token?.hash)
      if (!isValidHash) {
        setError('token', t('errors.invalidToken'))
        hasError = true
      }

      if (actionData.limit) {
        const limitBn = BSBigNumber(actionData.limit)
        if (limitBn.isNaN() || limitBn.isNegative() || (limit && limitBn.isLessThanOrEqualTo(limit))) {
          setError('limit', t('errors.invalidLimit'))
          hasError = true
        }
      }

      if (hasError) {
        throw new Error(t('errors.validation'))
      }

      const senderAccount = await AccountHelper.getServiceAccount(stellarAccount)

      const transaction = await service.trustlineService.changeTrustline({
        senderAccount,
        token: actionData.token!,
        limit: actionData.limit,
      })

      const pendingTransaction = TransactionHelper.buildPendingTransaction({
        transaction,
        account: stellarAccount,
        senderAccount: stellarAccount,
      })

      const notificationPrefix = 'modals:stellarPersistTrustlines'
      const notificationSuccessPrefix = `${notificationPrefix}.successNotification`
      const notificationFailurePrefix = `${notificationPrefix}.failureNotification`

      dispatch(
        thunks.waitPendingTransaction({
          pendingTransaction,
          successNotification: {
            title: `${notificationSuccessPrefix}.title`,
            previewBody: `${notificationSuccessPrefix}.previewBody`,
          },
          failureNotification: {
            title: `${notificationFailurePrefix}.title`,
            previewBody: `${notificationFailurePrefix}.previewBody`,
          },
        })
      )
    },
    onSuccess: () => {
      ToastHelper.success({ message: isEditing ? t('editSuccessToastMessage') : t('addSuccessToastMessage') })
      queryClient.invalidateQueries({
        queryKey: buildStellarTrustlinesQueryKey(stellarAccount, networkByBlockchain.stellar),
      })
      modalErase()
      navigate('/wallets/transactions', { state: { account: stellarAccount } })
    },
    onError: error => {
      LoggerHelper.sentry(error, { where: 'StellarPersistTrustlines' })
      ToastHelper.error({ message: isEditing ? t('editErrorToastMessage') : t('addErrorToastMessage') })
    },
  })

  return (
    <SideModalLayout
      heading={token ? t('editTitle') : t('addTitle')}
      contentClassName="flex flex-col text-gray-100"
      headingIcon={<TbShieldCheck aria-hidden />}
    >
      <p className="text-sm">{isEditing ? t('editDescription') : t('addDescription')}</p>

      <form
        className="mt-5 flex grow flex-col justify-between gap-5"
        onSubmit={handleAct(async () => {
          await trustlineMutation.mutateAsync()
        })}
      >
        <div className="w-full">
          <label className="mb-2 block text-xs font-bold text-gray-100 uppercase">{t('tokenLabel')}</label>

          <SearchableTokenSelect.Root
            value={actionData.token}
            onValueChange={token => setData({ token })}
            onSearch={getTrustlinesTokens}
          >
            <SearchableTokenSelect.Trigger className="w-full" disabled={isEditing}>
              <SearchableTokenSelect.Value />
            </SearchableTokenSelect.Trigger>

            <SearchableTokenSelect.Content>
              <SearchableTokenSelect.Input />

              <SearchableTokenSelect.List />
            </SearchableTokenSelect.Content>
          </SearchableTokenSelect.Root>
        </div>

        <Input
          label={t('limitLabel')}
          type="number"
          id="limit"
          name="limit"
          compacted
          value={actionData.limit}
          onChange={setDataFromEventWrapper('limit')}
          errorMessage={actionState.errors.limit}
        />

        <Button
          type="submit"
          className="mt-auto"
          label={isEditing ? t('editButtonLabel') : t('addButtonLabel')}
          loading={trustlineMutation.isPending}
          flat
        />
      </form>
    </SideModalLayout>
  )
}

export default StellarPersistTrustlines
