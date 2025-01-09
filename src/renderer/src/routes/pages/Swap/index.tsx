import { useTranslation } from 'react-i18next'
import { TbReplace } from 'react-icons/tb'
import { Location, useLocation } from 'react-router-dom'
import { ConnectHardwareWalletButton } from '@renderer/components/ConnectHardwareWalletButton'
import { HelpButton } from '@renderer/components/HelpButton'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { IAccountState } from '@shared/@types/store'

import { SwapPageContent } from './SwapPageContent'

type TLocationState = {
  account?: IAccountState
}

export const SwapPage = () => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'swap' })

  const rightComponent = (
    <div className="flex gap-x-2">
      <ConnectHardwareWalletButton />

      <HelpButton />
    </div>
  )

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbReplace />} rightComponent={rightComponent}>
      <SwapPageContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={rightComponent}>
      <SwapPageContent />
    </MainLayout>
  )
}
