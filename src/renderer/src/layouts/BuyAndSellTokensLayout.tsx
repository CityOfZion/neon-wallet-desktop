import { Dispatch, ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { MdInfoOutline, MdLaunch } from 'react-icons/md'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { Tabs } from '@renderer/components/Tabs'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { IAccountState } from '@shared/@types/store'

import { BuyAndSellTokensScreenType } from '../routes/pages/BuyAndSellTokens'
import { BuyAndSellTokensAccordionAccounts } from '../routes/pages/BuyAndSellTokens/BuyAndSellTokensAccordionAccounts'

type TProps = {
  hidden: boolean
  isLoading: boolean
  screenType: BuyAndSellTokensScreenType
  setScreenType: Dispatch<BuyAndSellTokensScreenType>
  children: ReactNode
  leftActions?: ReactNode
  account?: IAccountState
}

export const BuyAndSellTokensLayout = ({
  hidden,
  isLoading,
  screenType,
  setScreenType,
  account,
  leftActions,
  children,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyAndSellTokensLayout' })
  const [isAccordionAccountsOpened, setIsAccordionAccountsOpened] = useState(true)

  const handleChangeScreenType = (screenType: BuyAndSellTokensScreenType) => () => {
    setScreenType(screenType)
  }

  const toggleAccordionAccounts = () => {
    setIsAccordionAccountsOpened(previousValue => !previousValue)
  }

  return (
    <section className={StyleHelper.mergeStyles('flex rounded bg-gray-700/60 flex-grow min-h-0', { hidden: hidden })}>
      <div className="flex flex-col w-[24%] max-w-[22rem] bg-gray-900/50 px-4 border-r border-gray-300/15">
        <div className="flex gap-2.5 items-center h-12">
          <MdInfoOutline aria-hidden={true} className="w-6 h-6 text-green" />

          <h2 className="text-white my-3 text-sm">{t('howWorks.title')}</h2>
        </div>

        <Separator />

        <p className="text-xs text-white font-semibold my-7">{t('howWorks.description')}</p>

        <Separator />

        <p className="text-xs text-gray-100 font-semibold mt-7 uppercase">{t('whereBegin.title')}</p>

        <p className="text-xs text-white mt-4">{t('whereBegin.description')}</p>

        <AlertErrorBanner
          className="mt-6 bg-magenta-700/50 gap-3 p-3"
          message={t('cards.kyc')}
          messageClassName="font-normal text-xs leading-4"
          iconClassName="self-start"
        />

        <div className="flex flex-grow w-full items-end">
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
            rightIcon={<MdLaunch aria-hidden={true} />}
          />
        </div>
      </div>

      <div className="min-h-0 flex-grow flex flex-col px-4 items-center">
        <div className="flex flex-col w-full">
          <div className="flex justify-between gap-x-4 w-full h-12">
            <div className="flex items-center w-56 gap-x-2">{leftActions}</div>

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

            <div className="flex items-center w-56 justify-end gap-x-2">
              <Button
                label={t('buttons.walletsAndAccounts')}
                aria-expanded={isAccordionAccountsOpened}
                aria-controls="buy-and-sell-tokens-accordion-accounts"
                aria-label={t(`labels.walletsAndAccounts.${isAccordionAccountsOpened ? 'opened' : 'closed'}`)}
                className={StyleHelper.mergeStyles('py-1.5 px-3 rounded transition-colors', {
                  'bg-gray-300/15': !isLoading && isAccordionAccountsOpened,
                })}
                textClassName="font-normal"
                variant="text-slim"
                colorSchema={isLoading ? 'gray' : 'neon'}
                disabled={isLoading}
                rightIcon={
                  isAccordionAccountsOpened ? (
                    <IoChevronUp aria-hidden={true} className="w-5 h-5 min-w-5 min-h-5" />
                  ) : (
                    <IoChevronDown aria-hidden={true} className="w-5 h-5 min-w-5 min-h-5" />
                  )
                }
                onClick={toggleAccordionAccounts}
              />
            </div>
          </div>

          <Separator />
        </div>

        {isLoading && <Loader className="w-14 h-14 text-neon mt-6" />}

        <div
          className={StyleHelper.mergeStyles('flex flex-grow min-h-0 w-full justify-between relative', {
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
