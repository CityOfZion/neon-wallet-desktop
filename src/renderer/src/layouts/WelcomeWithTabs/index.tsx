import { useTranslation } from 'react-i18next'
import NeonWalletFullImage from '@renderer/assets/images/neon-wallet-full.svg?react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TLoginSessionType } from '@shared/@types/store'

import { WelcomeTabs } from './WelcomeTabs'

type TProps = {
  tabItemSelected: TLoginSessionType
  children: React.ReactNode
  contentClassName?: string
}

export const WelcomeWithTabsLayout = ({ tabItemSelected, children, contentClassName }: TProps) => {
  const { t } = useTranslation('layouts', { keyPrefix: 'welcomeWithTabs' })

  return (
    <section className="flex h-screen-minus-drag-region w-screen items-center justify-center bg-asphalt">
      <div
        className={StyleHelper.mergeStyles(
          'relative flex h-full max-h-[38.375rem] w-full max-w-[32rem] flex-col items-center rounded bg-gray-800 px-16 pb-10 pt-11',
          contentClassName
        )}
      >
        <NeonWalletFullImage aria-hidden={true} />

        <h1 className="mt-6 text-2xl text-white">{t('welcomeTo')}</h1>

        <WelcomeTabs defaultValue={tabItemSelected} />

        {children}
      </div>
    </section>
  )
}
