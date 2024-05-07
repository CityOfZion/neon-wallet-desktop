import { useTranslation } from 'react-i18next'
import { TbStepOut } from 'react-icons/tb'
import { useLocation } from 'react-router-dom'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'

import { SendPageContent } from './SendPageContent'

export const SendPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { state } = useLocation()

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepOut />}>
      <SendPageContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')}>
      <SendPageContent />
    </MainLayout>
  )
}
