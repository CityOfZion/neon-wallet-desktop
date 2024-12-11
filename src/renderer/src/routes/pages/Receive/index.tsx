import { useTranslation } from 'react-i18next'
import { TbStepInto } from 'react-icons/tb'
import { Location, useLocation } from 'react-router-dom'
import { HelpButton } from '@renderer/components/HelpButton'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { IAccountState } from '@shared/@types/store'

import { ReceivePageContent } from './ReceivePageContent'

type TLocationState = {
  account?: IAccountState
}

export const ReceiveYourAddress = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'receive' })
  const { state } = useLocation() as Location<TLocationState>

  const rightComponent = (
    <div className="flex gap-x-2">
      <HelpButton />
    </div>
  )

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepInto />} rightComponent={rightComponent}>
      <ReceivePageContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={rightComponent}>
      <ReceivePageContent />
    </MainLayout>
  )
}
