import { useTranslation } from 'react-i18next'
import { ReactComponent as NeonWalletFullImage } from '@renderer/assets/images/neon-wallet-full.svg'
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
    <section className="flex justify-center items-center w-screen h-screen-minus-drag-region bg-asphalt">
      <div
        className={StyleHelper.mergeStyles(
          'flex flex-col items-center w-full h-full bg-gray-800 max-h-[38.375rem] max-w-[32rem] pb-10 pt-11 px-16 rounded relative',
          contentClassName
        )}
      >
        <NeonWalletFullImage />

        <h1 className="text-2xl text-white mt-6">{t('welcomeTo')}</h1>

        <WelcomeTabs defaultValue={tabItemSelected} />

        {children}
      </div>
    </section>
  )
}
