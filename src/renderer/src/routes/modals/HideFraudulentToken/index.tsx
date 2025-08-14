import { useMemo, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { BSTokenHelper } from '@cityofzion/blockchain-service'
import TbEyeOff from '@renderer/assets/images/tb-eye-off.svg?react'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { TokensHelper } from '@renderer/helpers/TokensHelper'
import { useBalances } from '@renderer/hooks/useBalances'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { utilityReducerActions } from '@renderer/store/reducers/UtilityReducer'
import { IAccountState } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

type TModalStateParams = {
  account: IAccountState
  hash: string
}

export const HideFraudulentTokenModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'hideFraudulentToken' })
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { modalErase } = useModalNavigate()
  const { account, hash } = useModalState<TModalStateParams>()
  const balancesQuery = useBalances([account], { showType: 'active' })
  const dispatch = useAppDispatch()
  const [isHiding, startHidingTransition] = useTransition()

  const tokenBalance = useMemo(() => {
    if (balancesQuery.isLoading) return undefined

    const normalizedHash = BSTokenHelper.normalizeHash(hash)

    return balancesQuery.data?.[0]?.tokensBalances?.find(
      ({ token }) => BSTokenHelper.normalizeHash(token.hash) === normalizedHash
    )
  }, [balancesQuery.data, balancesQuery.isLoading, hash])

  const isNativeToken = useMemo(() => TokensHelper.isNativeToken(hash, account.blockchain), [hash, account])

  const isDisabled = isHiding || isNativeToken || !tokenBalance

  const handleHide = () => {
    if (isDisabled) return

    startHidingTransition(() => {
      try {
        dispatch(utilityReducerActions.toggleHiddenToken({ hash, blockchain: account.blockchain }))
        modalErase('center')
      } catch (error) {
        ToastHelper.error({ message: t('hideErrorMessage') })
      }
    })
  }

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center px-0 gap-y-2 pb-6 m-0 pt-0 text-white">
      <h2 className="text-center text-xl font-semibold">{t('title')}</h2>

      <p className="text-center text-sm text-gray-100">{t('text')}</p>

      <p className="mt-4 w-full text-left text-xs font-bold uppercase text-gray-300">{t('details')}</p>

      <div className="w-full items-center justify-center rounded border border-gray-600 bg-gray-900 p-3 text-sm">
        {match({ isLoading: balancesQuery.isLoading, tokenBalance })
          .with({ isLoading: true }, () => <Loader containerClassName="my-4" className="size-8" />)
          .with({ tokenBalance: P.when(value => !value) }, () => (
            <p className="w-full px-2 py-4 text-center font-semibold">{t('notFoundTokenLabel')}</p>
          ))
          .otherwise(() => (
            <ul className="flex flex-col gap-y-2">
              <li className="break-all border-b border-gray-600 pb-2">
                <strong className="font-semibold">{t('tokenHashLabel')}</strong> {hash}
              </li>
              <li className="border-b border-gray-600 pb-2">
                <strong className="font-semibold">{t('tokenNameLabel')}</strong> {tokenBalance!.token.name} (
                {tokenBalance!.token.symbol})
              </li>
              <li className="border-b border-gray-600 pb-2">
                <strong className="font-semibold">{t('blockchainLabel')}</strong>{' '}
                {tCommonBlockchain(account.blockchain)}
              </li>
              <li>
                <strong className="font-semibold">{t('amountLabel')}</strong> {tokenBalance!.amount}
              </li>
            </ul>
          ))}
      </div>

      <Button
        label={t('hideTokenButtonLabel')}
        className="mt-8 w-full"
        variant="contained"
        colorSchema="neon"
        iconsOnEdge={false}
        loading={isHiding}
        disabled={isDisabled}
        rightIcon={<TbEyeOff aria-hidden />}
        onClick={handleHide}
      />
    </CenterModalLayout>
  )
}
