import { Dispatch, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdChevronRight } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { sellTokensIframeUrl } from '@renderer/constants/buy-and-sell-tokens'
import { BuyAndsellTokensHelper } from '@renderer/helpers/BuyAndsellTokensHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { BuyAndSellTokensLayout } from '@renderer/layouts/BuyAndSellTokensLayout'
import { IAccountState } from '@shared/@types/store'

import { BuyAndSellTokensScreenType, TDepositActionsData } from './index'

type TProps = {
  account?: IAccountState
  hidden: boolean
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
}

export const SellTokensContent = ({
  hidden,
  account,
  depositActionsData,
  setDepositActionsData,
  setScreenType,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.sellTokensContent' })
  const { currency } = useCurrencySelector()
  const { modalNavigateWrapper } = useModalNavigate()
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [hasIframeError, setHasIframeError] = useState(false)

  const url = BuyAndsellTokensHelper.getMountedUrl({ domainUrl: sellTokensIframeUrl, currency, account })

  const handleLoad = async () => {
    await UtilsHelper.sleep(4000)

    setIsIframeLoading(false)
  }

  const handleError = () => {
    setHasIframeError(true)
  }

  return (
    <BuyAndSellTokensLayout
      hidden={hidden}
      isLoading={isIframeLoading}
      screenType={BuyAndSellTokensScreenType.SELL_TOKENS}
      setScreenType={setScreenType}
      account={account}
      leftActions={
        <Button
          label={t('buttons.deposit')}
          textClassName="font-normal"
          variant="text-slim"
          colorSchema={isIframeLoading ? 'gray' : 'neon'}
          disabled={isIframeLoading}
          rightIcon={<MdChevronRight aria-hidden={true} className="w-5 h-5 min-w-5 min-h-5" />}
          onClick={modalNavigateWrapper('sell-tokens-deposit', {
            state: { account, depositActionsData, setDepositActionsData },
          })}
        />
      }
    >
      <div className="buy-and-sell-tokens-iframe-container my-4">
        {hasIframeError ? (
          <p className="text-white text-center text-xl mx-auto p-4">{t('error')}</p>
        ) : (
          <iframe src={`${url}&redirectUrl=${url}`} onLoad={handleLoad} onError={handleError} />
        )}
      </div>
    </BuyAndSellTokensLayout>
  )
}
