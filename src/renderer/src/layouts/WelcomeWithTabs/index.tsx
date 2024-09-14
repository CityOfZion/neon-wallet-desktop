import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as NeonWalletFullImage } from '@renderer/assets/images/neon-wallet-full.svg'

import { WelcomeTabItemType, WelcomeTabs } from './WelcomeTabs'

type TProps = {
  tabItemType: WelcomeTabItemType
}

export const WelcomeWithTabsLayout: React.FC<TProps> = ({ tabItemType, children }) => {
  const { t } = useTranslation('layouts', { keyPrefix: 'welcomeWithTabs' })

  return (
    <section className={'flex justify-center items-center w-screen h-screen-minus-drag-region bg-asphalt'}>
      <div
        className={
          'flex flex-col items-center w-full h-full bg-gray-800 max-h-[38.375rem] max-w-[32rem] pb-10 pt-11 px-16 rounded relative'
        }
      >
        <NeonWalletFullImage alt={t('logoAlt')} />

        <h1 className={'text-2xl text-white mt-6'}>{t('welcomeTo')}</h1>

        <WelcomeTabs defaultValue={tabItemType} />

        {children}
      </div>
    </section>
  )
}
