import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { Location, useLocation } from 'react-router-dom'
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

  return state?.account || state?.recipient ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepOut />}>
      <SendPageContent account={state?.account} recipientAddress={state?.recipient} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')}>
      <SendPageContent />
    </MainLayout>
  )
}
