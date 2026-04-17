import { BSBigHumanAmount, type TBSToken } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { SearchableTokenSelect } from '@renderer/components/SearchableTokenSelect'

import { useActions } from '@renderer/hooks/useActions'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useLazyStellarGetTrustlineTokens, usePersistTrustlineMutation } from '@renderer/hooks/useStellarTruslines'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbShieldCheck from '@renderer/assets/images/tb-shield-check.svg?react'

import type { TModalState } from '@shared/types/modal'

type TActionsData = {
  token: TBSToken | undefined
  limit: string
  isLimitFormatting: boolean
}

const StellarPersistTrustlines = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'stellarPersistTrustlines' })
  const { stellarAccount, token, limit } = useModalState<TModalState<'stellar-persist-trustlines'>>()
  const { modalErase } = useModalNavigate()
  const debounce = useDebounceFunction()

  const { getTrustlinesTokens } = useLazyStellarGetTrustlineTokens()
  const navigate = useNavigate()
  const trustlineMutation = usePersistTrustlineMutation()

  const { actionData, actionState, setData, setError, handleAct } = useActions<TActionsData>({
    token,
    limit: limit || '',
    isLimitFormatting: false,
  })

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = event.target.value

    setData({ limit, isLimitFormatting: true })

    debounce(() => {
      setData({
        limit: new BSBigHumanAmount(limit, actionData.token?.decimals).toFormatted(),
        isLimitFormatting: false,
      })
    })
  }

  const handleSubmit = async () => {
    if (!actionData.token) return

    if (actionData.limit) {
      const limitBn = new BSBigHumanAmount(actionData.limit, actionData.token.decimals)
      if (limit && limitBn.isLessThanOrEqualTo(limit)) {
        setError('limit', t('errors.invalidLimit'))
        return
      }
    }

    await trustlineMutation.mutateAsync({ stellarAccount, token: actionData.token, limit: actionData.limit })

    modalErase()
    navigate('/wallets/transactions', { state: { account: stellarAccount } })
  }

  return (
    <SideModalLayout
      heading={t('title')}
      contentClassName="flex flex-col text-gray-100"
      headingIcon={<TbShieldCheck aria-hidden />}
    >
      <form className="flex grow flex-col justify-between gap-5" onSubmit={handleAct(handleSubmit)}>
        <div className="w-full">
          <label className="mb-2 block text-xs font-bold text-gray-100 uppercase">{t('tokenLabel')}</label>

          <SearchableTokenSelect.Root
            value={actionData.token}
            onValueChange={token => setData({ token })}
            onSearch={getTrustlinesTokens}
          >
            <SearchableTokenSelect.Trigger className="w-full" disabled={!!token || actionState.isActing}>
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
          placeholder={t('limitPlaceholder')}
          type="text"
          id="limit"
          inputMode="decimal"
          name="limit"
          compacted
          disabled={!actionData.token || actionState.isActing}
          value={actionData.limit}
          onChange={handleLimitChange}
          errorMessage={actionState.errors.limit}
          loading={actionData.isLimitFormatting}
        />

        <Button type="submit" className="mt-auto" label={t('saveButtonLabel')} loading={actionState.isActing} flat />
      </form>
    </SideModalLayout>
  )
}

export default StellarPersistTrustlines
