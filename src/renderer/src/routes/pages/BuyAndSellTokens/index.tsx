import { Dispatch, Fragment, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Location, useBlocker, useLocation, useNavigate } from 'react-router-dom'
import TbShoppingBag from '@renderer/assets/images/tb-shopping-bag.svg?react'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { isConfigured } from '@renderer/constants/buy-and-sell-tokens'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

import { BuyTokensContent } from './BuyTokensContent'
import { SellTokensContent } from './SellTokensContent'

type TLocationState = {
  account?: IAccountState
  screenType?: BuyAndSellTokensScreenType
}

export enum BuyAndSellTokensScreenType {
  BUY_TOKENS = 'buy-tokens',
  SELL_TOKENS = 'sell-tokens',
}

export type TDepositActionsData = {
  amount: string
  isAmountLoading: boolean
  address: string
  isFeeLoading: boolean
  fee?: string
  token?: TTokenBalance
  account?: IAccountState
}

type TBuyAndSellTokensContentProps = {
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  screenType: BuyAndSellTokensScreenType
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  account?: IAccountState
}

const BuyAndSellTokensContent = ({
  account,
  depositActionsData,
  setDepositActionsData,
  screenType,
  setScreenType,
}: TBuyAndSellTokensContentProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })

  if (!isConfigured)
    return <h2 className="rounded bg-gray-700/60 px-4 py-14 text-center text-2xl text-white">{t('notConfigured')}</h2>

  return (
    <Fragment>
      <BuyTokensContent
        hidden={screenType !== BuyAndSellTokensScreenType.BUY_TOKENS}
        account={account}
        setScreenType={setScreenType}
        {...TestHelper.buildTestObject('buy-tokens-content-layout')}
      />

      <SellTokensContent
        hidden={screenType !== BuyAndSellTokensScreenType.SELL_TOKENS}
        account={account}
        depositActionsData={depositActionsData}
        setDepositActionsData={setDepositActionsData}
        setScreenType={setScreenType}
        {...TestHelper.buildTestObject('sell-tokens-content-layout')}
      />
    </Fragment>
  )
}

export const BuyAndSellTokensPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { state } = useLocation() as Location<TLocationState>
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()
  const [screenType, setScreenType] = useState(state?.screenType ?? BuyAndSellTokensScreenType.BUY_TOKENS)
  const [depositActionsData, setDepositActionsData] = useState<TDepositActionsData | null>(null)
  const canNavigateRef = useRef(false)

  const account = state?.account

  const setCanNavigate = (canNavigate: boolean) => {
    canNavigateRef.current = canNavigate
  }

  const handleBackClick = () => {
    navigate(`/app/wallets/${account!.id}/overview`)
  }

  useBlocker(({ nextLocation }) => {
    const nextUrl = nextLocation.pathname

    if (canNavigateRef.current || nextUrl === '/app/buy-and-sell-tokens') return false

    modalNavigate('buy-and-sell-tokens-leave-alert', { state: { nextUrl, setCanNavigate } })

    return true
  })

  return account ? (
    <ContentLayout
      title={t('title')}
      titleIcon={<TbShoppingBag aria-hidden={true} />}
      rightComponent={<CommonScreenActions />}
      onBackClick={handleBackClick}
    >
      <BuyAndSellTokensContent
        account={account}
        depositActionsData={depositActionsData}
        setDepositActionsData={setDepositActionsData}
        screenType={screenType}
        setScreenType={setScreenType}
      />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <BuyAndSellTokensContent
        depositActionsData={depositActionsData}
        setDepositActionsData={setDepositActionsData}
        screenType={screenType}
        setScreenType={setScreenType}
      />
    </MainLayout>
  )
}
