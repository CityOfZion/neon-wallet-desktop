import { useTranslation } from 'react-i18next'
import { TbStepInto } from 'react-icons/tb'
import { useLocation } from 'react-router-dom'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'

import { ReceiveYourAddressContent } from './ReceivePageContent'

export const ReceiveYourAddress = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'receive' })
  const { state } = useLocation()

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepInto />}>
      <ReceiveYourAddressContent />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')}>
      <ReceiveYourAddressContent />
    </MainLayout>
  )
}
