import { ComponentProps, Dispatch, Fragment, ReactNode, useState } from 'react'

import { Trans, useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { Tabs } from '@renderer/components/Tabs'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import TbChevronDown from '@renderer/assets/images/tb-chevron-down.svg?react'
import TbChevronUp from '@renderer/assets/images/tb-chevron-up.svg?react'

import { DISCORD_LINK } from '@renderer/constants/urls'
import { IAccountState } from '@shared/@types/store'

import { BuyAndSellTokensScreenType } from '../routes/pages/BuyAndSellTokens'
import { BuyAndSellTokensAccordionAccounts } from '../routes/pages/BuyAndSellTokens/BuyAndSellTokensAccordionAccounts'

type TAboutDataButtonProps = {
  className?: string
}

const AboutDataButton = ({ className }: TAboutDataButtonProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyAndSellTokensLayout' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <Button
      label={t('buttons.aboutData')}
      colorSchema="neon"
      variant="text-slim"
      className={StyleHelper.mergeStyles('w-fit', className)}
      clickableProps={{ className: 'text-xs' }}
      onClick={modalNavigateWrapper('buy-and-sell-tokens-about-data')}
    />
  )
}

type TProps = {
  hidden: boolean
  isLoading: boolean
  screenType: BuyAndSellTokensScreenType
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  children: ReactNode
  leftActions?: ReactNode
  account?: IAccountState
} & ComponentProps<'section'>

export const BuyAndSellTokensLayout = ({
  hidden,
  isLoading,
  screenType,
  setScreenType,
  account,
  leftActions,
  children,
  ...props
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyAndSellTokensLayout' })
  const [isAccordionAccountsOpened, setIsAccordionAccountsOpened] = useState(false)

  const handleChangeScreenType = (screenType: BuyAndSellTokensScreenType) => () => {
    setScreenType(screenType)
  }

  const toggleAccordionAccounts = () => {
    setIsAccordionAccountsOpened(previousValue => !previousValue)
  }

  return (
    <section
      className={StyleHelper.mergeStyles('flex min-h-0 grow rounded-sm bg-gray-800', { hidden: hidden })}
      {...props}
    >
      <div className="flex w-[27%] max-w-88 flex-col border-r border-gray-300/15 bg-gray-900/50 px-4">
        <div className="flex h-12 items-center gap-2.5">
          <MdInfoOutline aria-hidden className="text-green size-6" />

          <h2 className="my-3 text-sm text-white">{t('howWorks.title')}</h2>
        </div>

        <Separator />

        <p className="mt-7 mb-5 text-xs font-semibold text-white">{t('howWorks.description')}</p>

        <Separator containerClassName="mb-5" />

        {match(screenType)
          .with(BuyAndSellTokensScreenType.BUY_TOKENS, () => (
            <Fragment>
              <p className="text-xs text-white">
                <Trans t={t} i18nKey="processes.buyTokens.text">
                  start
                  <strong className="block font-bold">middle</strong>
                  <em className="italic">end</em>
                </Trans>
              </p>

              <AboutDataButton className="mt-1" />

              <p className="mt-5 text-xs text-white">
                <Trans t={t} i18nKey="processes.buyTokens.kyc">
                  start
                  <span className="font-bold">middle</span>
                  end
                </Trans>
              </p>

              <AlertErrorBanner
                className="bg-magenta-700/50 mt-6 gap-3 p-3"
                message={t('processes.buyTokens.alert')}
                messageClassName="font-normal text-xs leading-4"
                iconClassName="self-start"
              />
            </Fragment>
          ))
          .with(BuyAndSellTokensScreenType.SELL_TOKENS, () => (
            <Fragment>
              <p className="text-xs text-white">
                <Trans t={t} i18nKey="processes.sellTokens.text">
                  start
                  <strong className="block font-bold">middle</strong>
                  <em className="italic">end</em>
                </Trans>
              </p>

              <AboutDataButton className="mt-1" />

              <p className="mt-5 text-xs text-white">
                <Trans t={t} i18nKey="processes.sellTokens.kyc">
                  start
                  <span className="font-bold">middle</span>
                  end
                </Trans>
              </p>

              <AlertErrorBanner
                className="bg-magenta-700/50 mt-6 gap-3 p-3"
                message={
                  <Trans t={t} i18nKey="processes.sellTokens.alert">
                    start
                    <span className="uppercase">middle</span>
                    end
                  </Trans>
                }
                messageClassName="font-normal text-xs leading-4"
                iconClassName="self-start"
              />
            </Fragment>
          ))
          .otherwise(() => null)}

        <p className="mt-5 text-xs text-white">{t('processes.all.observation')}</p>

        <div className="mt-7 flex w-full grow items-end">
          <Link
            label={t('buttons.help')}
            to={DISCORD_LINK}
            target="_blank"
            className="mx-auto mb-7"
            textClassName="font-normal"
            colorSchema="neon"
            variant="outlined"
            flat
            wide
            iconsOnEdge={false}
            rightIcon={<MdLaunch aria-hidden />}
          />
        </div>
      </div>

      <div className="flex min-h-0 grow flex-col items-center px-4">
        <div className="flex w-full flex-col">
          <div className="flex h-12 w-full justify-between gap-x-4">
            <div className="flex w-72 items-center gap-x-2">{leftActions}</div>

            <Tabs.Root value={screenType} className="h-fit self-end">
              <Tabs.List className="w-full">
                <Tabs.Trigger
                  value={BuyAndSellTokensScreenType.BUY_TOKENS}
                  className="px-6 uppercase"
                  onClick={handleChangeScreenType(BuyAndSellTokensScreenType.BUY_TOKENS)}
                >
                  {t('tabs.buyTokens')}
                </Tabs.Trigger>

                <Tabs.Trigger
                  value={BuyAndSellTokensScreenType.SELL_TOKENS}
                  className="px-6 uppercase"
                  onClick={handleChangeScreenType(BuyAndSellTokensScreenType.SELL_TOKENS)}
                >
                  {t('tabs.sellTokens')}
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            <div className="flex w-72 items-center justify-end gap-x-2">
              <Button
                label={t('buttons.walletsAndAccounts')}
                aria-expanded={isAccordionAccountsOpened}
                aria-controls="buy-and-sell-tokens-accordion-accounts"
                aria-label={t(`labels.walletsAndAccounts.${isAccordionAccountsOpened ? 'opened' : 'closed'}`)}
                className={StyleHelper.mergeStyles('rounded-sm px-3 py-1.5 transition-colors', {
                  'bg-gray-300/15': !isLoading && isAccordionAccountsOpened,
                })}
                textClassName="font-normal"
                variant="text-slim"
                colorSchema={isLoading ? 'gray' : 'neon'}
                disabled={isLoading}
                rightIcon={
                  isAccordionAccountsOpened ? (
                    <TbChevronUp aria-hidden className="h-5 min-h-5 w-5 min-w-5" />
                  ) : (
                    <TbChevronDown aria-hidden className="h-5 min-h-5 w-5 min-w-5" />
                  )
                }
                onClick={toggleAccordionAccounts}
              />
            </div>
          </div>

          <Separator />
        </div>

        {isLoading && <Loader className="text-neon mt-6 h-14 w-14" />}

        <div
          className={StyleHelper.mergeStyles('relative flex min-h-0 w-full grow justify-between', {
            hidden: isLoading,
          })}
        >
          {children}

          <BuyAndSellTokensAccordionAccounts account={account} isOpened={isAccordionAccountsOpened} />
        </div>
      </div>
    </section>
  )
}
