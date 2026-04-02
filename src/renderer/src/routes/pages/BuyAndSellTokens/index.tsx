import { type ComponentProps, Fragment, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { Trans, useTranslation } from 'react-i18next'
import { Location, useBlocker, useLocation, useNavigate, useParams } from 'react-router'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { Link } from '@renderer/components/Link'
import { ScreenLoader } from '@renderer/components/ScreenLoader'
import { Separator } from '@renderer/components/Separator'
import { Tabs } from '@renderer/components/Tabs'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'

import MdChevronRight from '@renderer/assets/images/md-chevron-right.svg?react'
import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import MdRestartAlt from '@renderer/assets/images/md-restart-alt.svg?react'
import TbChevronDown from '@renderer/assets/images/tb-chevron-down.svg?react'
import TbChevronUp from '@renderer/assets/images/tb-chevron-up.svg?react'
import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'
import TbShoppingBag from '@renderer/assets/images/tb-shopping-bag.svg?react'

import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import type { TTokenBalance } from '@shared/types/query'
import { TAccount } from '@shared/types/store'

import { BuyAndSellTokensAccordionAccounts } from './BuyAndSellTokensAccordionAccounts'
import { BuyAndSellTokensBuyIframe } from './BuyAndSellTokensBuyIframe'
import { BuyAndSellTokensSellIframe } from './BuyAndSellTokensSellIframe'

type TLocationState = {
  account?: TAccount
}

type TParams = {
  tab?: 'buy' | 'sell'
}

export type TDepositActionsData = {
  amount: string
  isAmountLoading: boolean
  address: string
  isFeeLoading: boolean
  fee?: string
  token?: TTokenBalance
  account?: TAccount
}

const Layout = (props: ComponentProps<'div'>) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { state } = useLocation() as Location<TLocationState>

  return state?.account ? (
    <ContentLayout
      title={t('title')}
      titleIcon={<TbShoppingBag aria-hidden />}
      rightComponent={<CommonScreenActions />}
      {...props}
    />
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />} {...props} />
  )
}

const BuyAndSellTokensPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const location = useLocation() as Location<TLocationState>
  const { tab = 'buy' } = useParams<TParams>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const navigate = useNavigate()

  const [depositActionsData, setDepositActionsData] = useState<TDepositActionsData | null>(null)
  const [isAccordionAccountsOpened, setIsAccordionAccountsOpened] = useState(false)
  const [iframeId, setIframeId] = useState(UtilsHelper.uuid())
  const [isBuyReady, setIsBuyReady] = useState<boolean | undefined>(undefined)
  const [isSellReady, setIsSellReady] = useState<boolean | undefined>(undefined)

  const shouldSkipBlockerRef = useRef(false)

  const account = location.state?.account
  const isReady = isBuyReady && isSellReady

  const handleToggleAccordionAccounts = () => {
    setIsAccordionAccountsOpened(previousValue => !previousValue)
  }

  const handleRestart = () => {
    setIsBuyReady(false)
    setIsSellReady(false)
    setIframeId(UtilsHelper.uuid())
    setDepositActionsData(null)
  }

  useBlocker(({ nextLocation }) => {
    const nextUrl = nextLocation.pathname

    if (shouldSkipBlockerRef.current || nextUrl.includes('/buy-and-sell-tokens')) return false

    modalNavigate('buy-and-sell-tokens-leave-alert', {
      state: {
        onContinue: async () => {
          shouldSkipBlockerRef.current = true
          await SharedUtilsHelper.sleep(500)
          navigate(nextUrl)
        },
      },
    })

    return true
  })

  return (
    <Layout>
      <section
        className="flex min-h-0 grow rounded-sm bg-gray-700/60"
        {...TestHelper.buildTestObject('buy-tokens-content')}
      >
        <div className="flex w-[27%] max-w-88 flex-col border-r border-gray-300/15 bg-gray-900/50 px-4">
          <div className="flex h-13 items-center gap-2.5">
            <MdInfoOutline aria-hidden className="text-green size-6" />
            <h2 className="text-sm text-white">{t('howItWorks.title')}</h2>
          </div>

          <Separator />

          <div className="relative my-7 flex h-full flex-col gap-5">
            <p className="text-xs font-semibold text-white">{t('howItWorks.description')}</p>

            <Separator containerClassName="my-6" />

            <div className="relative">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex h-full flex-col gap-5"
                >
                  {tab === 'buy' ? (
                    <Fragment>
                      <div>
                        <p className="text-xs text-white">
                          <Trans t={t} i18nKey="howItWorks.buyTokens.text">
                            start
                            <strong className="block font-bold">middle</strong>
                            <em className="italic">end</em>
                          </Trans>
                        </p>

                        <Button
                          label={t('aboutDataButtonLabel')}
                          colorSchema="neon"
                          variant="text-slim"
                          flat
                          className="w-fit"
                          onClick={modalNavigateWrapper('buy-and-sell-tokens-about-data')}
                        />
                      </div>

                      <p className="text-xs text-white">
                        <Trans t={t} i18nKey="howItWorks.buyTokens.kyc">
                          start
                          <span className="font-bold">middle</span>
                          end
                        </Trans>
                      </p>

                      <AlertErrorBanner
                        className="bg-magenta-700/50 gap-3 p-3"
                        message={t('howItWorks.buyTokens.alert')}
                        messageClassName="font-normal text-xs leading-4"
                        iconClassName="self-start"
                      />

                      <p className="text-xs text-white">{t('howItWorks.observation')}</p>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <div>
                        <p className="text-xs text-white">
                          <Trans t={t} i18nKey="howItWorks.sellTokens.text">
                            start
                            <strong className="block font-bold">middle</strong>
                            <em className="italic">end</em>
                          </Trans>
                        </p>

                        <Button
                          label={t('aboutDataButtonLabel')}
                          colorSchema="neon"
                          variant="text-slim"
                          flat
                          className="w-fit"
                          onClick={modalNavigateWrapper('buy-and-sell-tokens-about-data')}
                        />
                      </div>

                      <p className="text-xs text-white">
                        <Trans t={t} i18nKey="howItWorks.sellTokens.kyc">
                          start
                          <span className="font-bold">middle</span>
                          end
                        </Trans>
                      </p>

                      <AlertErrorBanner
                        className="bg-magenta-700/50 gap-3 p-3"
                        message={
                          <Trans t={t} i18nKey="howItWorks.sellTokens.alert">
                            start
                            <span className="uppercase">middle</span>
                            end
                          </Trans>
                        }
                        messageClassName="font-normal text-xs leading-4"
                        iconClassName="self-start"
                      />

                      <p className="text-xs text-white">{t('howItWorks.observation')}</p>
                    </Fragment>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mx-auto mt-auto">
              <Link
                label={t('helpButtonLabel')}
                to={ConstantsHelper.cozDiscordUrl}
                target="_blank"
                colorSchema="neon"
                variant="outlined"
                rightIcon={<TbExternalLink aria-hidden />}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 grow flex-col items-center px-4">
          <div className="flex h-13 w-full items-center gap-x-4">
            <div className="flex flex-1 items-center gap-x-2">
              <Button
                label={t('restartButtonLabel')}
                variant="text"
                colorSchema="neon"
                flat
                disabled={!isReady}
                leftIcon={<MdRestartAlt aria-hidden />}
                onClick={handleRestart}
              />

              <AnimatePresence>
                {tab === 'sell' && (
                  <motion.div
                    className="flex items-center gap-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Separator containerClassName="w-0 h-full" className="h-7 w-px" />

                    <Button
                      label={t('depositButtonLabel')}
                      variant="text"
                      colorSchema="neon"
                      flat
                      disabled={!isReady}
                      rightIcon={<MdChevronRight aria-hidden />}
                      onClick={modalNavigateWrapper('sell-tokens-deposit', {
                        state: { account, depositActionsData, setDepositActionsData },
                      })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Tabs.Root value={tab}>
              <Tabs.List className="w-full">
                <Tabs.Trigger value="buy" className="py-4.5" onClick={() => navigate('/buy-and-sell-tokens/buy')}>
                  {t('buyTokensTabLabel')}
                </Tabs.Trigger>

                <Tabs.Trigger value="sell" className="py-4.5" onClick={() => navigate('/buy-and-sell-tokens/sell')}>
                  {t('sellTokensTabLabel')}
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div className="flex flex-1 items-center justify-end gap-x-2">
              <Button
                label={t('walletsAndAccountsButtonLabel')}
                aria-expanded={isAccordionAccountsOpened}
                aria-controls="buy-and-sell-tokens-accordion-accounts"
                aria-label={t(
                  isAccordionAccountsOpened
                    ? 'walletsAndAccountsOpenedButtonLabel'
                    : 'walletsAndAccountsClosedButtonLabel'
                )}
                variant="text"
                flat
                disabled={!isReady}
                colorSchema="neon"
                rightIcon={isAccordionAccountsOpened ? <TbChevronUp aria-hidden /> : <TbChevronDown aria-hidden />}
                onClick={handleToggleAccordionAccounts}
              />
            </div>
          </div>

          <Separator className="-mt-px" />

          <div className="relative flex min-h-0 w-full grow">
            {isReady === undefined && <ScreenLoader />}

            <motion.div
              key={`buy-${iframeId}`}
              className="absolute inset-0 mx-auto h-full w-min py-3"
              initial={{ opacity: isReady ? 1 : 0, y: 0 }}
              animate={
                tab === 'buy' && isReady ? { opacity: 1, y: 0, zIndex: 1 } : { opacity: 0, y: 10, zIndex: 'auto' }
              }
              transition={{ duration: 0.4 }}
            >
              <BuyAndSellTokensBuyIframe onReady={setIsBuyReady} />
            </motion.div>

            <motion.div
              key={`sell-${iframeId}`}
              className="absolute inset-0 mx-auto h-full w-min py-3"
              initial={{ opacity: isReady ? 1 : 0, y: -10 }}
              animate={
                tab === 'sell' && isReady ? { opacity: 1, y: 0, zIndex: 1 } : { opacity: 0, y: 10, zIndex: 'auto' }
              }
              transition={{ duration: 0.4 }}
            >
              <BuyAndSellTokensSellIframe iframeId={iframeId} onReady={setIsSellReady} />
            </motion.div>

            <BuyAndSellTokensAccordionAccounts account={account} isOpened={isAccordionAccountsOpened} />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default BuyAndSellTokensPage
