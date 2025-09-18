import { ComponentProps, Dispatch, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { sellTokensIframeUrl } from '@renderer/constants/buy-and-sell-tokens'
import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { BuyAndSellTokensLayout } from '@renderer/layouts/BuyAndSellTokensLayout'
import { IAccountState } from '@shared/@types/store'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { BuyAndSellTokensScreenType, TDepositActionsData } from './index'

type TProps = {
  account?: IAccountState
  hidden: boolean
  depositActionsData: TDepositActionsData | null
  setDepositActionsData: Dispatch<TDepositActionsData | null>
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
} & ComponentProps<'section'>

export const SellTokensContent = ({
  hidden,
  account,
  depositActionsData,
  setDepositActionsData,
  setScreenType,
  ...props
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.sellTokensContent' })
  const { currency } = useCurrencySelector()
  const { modalNavigateWrapper } = useModalNavigate()
  const [iframeId, setIframeId] = useState(UtilsHelper.uuid())
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [hasIframeError, setHasIframeError] = useState(false)
  const url = BuyAndSellTokensHelper.getMountedUrl({ domainUrl: sellTokensIframeUrl, currency, account })

  const handleRestart = () => {
    setDepositActionsData(null)
    setHasIframeError(false)
    setIsIframeLoading(true)
    setIframeId(UtilsHelper.uuid())
  }

  const handleLoad = async () => {
    await SharedUtilsHelper.sleep(4000)

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
        <div className="flex items-center gap-x-3">
          <Button
            label={t('buttons.restart')}
            variant="text-slim"
            textClassName="font-normal"
            colorSchema={isIframeLoading ? 'gray' : 'neon'}
            disabled={isIframeLoading}
            leftIcon={<MdRestartAlt aria-hidden={true} className="h-5 min-h-5 w-5 min-w-5" />}
            onClick={handleRestart}
          />

          <Separator containerClassName="w-0 h-full" className="h-7 w-px" />

          <Button
            label={t('buttons.deposit')}
            textClassName="font-normal"
            variant="text-slim"
            colorSchema={isIframeLoading ? 'gray' : 'neon'}
            disabled={isIframeLoading}
            rightIcon={<MdChevronRight aria-hidden={true} className="h-5 min-h-5 w-5 min-w-5" />}
            onClick={modalNavigateWrapper('sell-tokens-deposit', {
              state: { account, depositActionsData, setDepositActionsData },
            })}
          />
        </div>
      }
      {...props}
    >
      <div className="my-4 buy-and-sell-tokens-iframe-container">
        {hasIframeError ? (
          <p className="mx-auto p-4 text-center text-xl text-white">{t('error')}</p>
        ) : (
          <iframe
            src={`${url}&redirectUrl=${url}&confirmRedirectUrl${url}&reloadId=${iframeId}`}
            allow="clipboard-read; clipboard-write; payment"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    </BuyAndSellTokensLayout>
  )
}
