import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { Location, useLocation } from 'react-router-dom'
import { HelpButton } from '@renderer/components/HelpButton'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { IAccountState } from '@shared/@types/store'

import { SendPageContent } from './SendPageContent'

type TLocationState = {
  account?: IAccountState
  recipient?: string
}

export const SendPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { state } = useLocation() as Location<TLocationState>

  const rightComponent = (
    <div className="flex gap-x-2">
      <HelpButton />
    </div>
  )

  return state?.account || state?.recipient ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepOut />} rightComponent={rightComponent}>
      <SendPageContent account={state?.account} recipientAddress={state?.recipient} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={rightComponent}>
      <SendPageContent />
    </MainLayout>
  )
}
