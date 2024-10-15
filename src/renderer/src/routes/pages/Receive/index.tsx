import { useTranslation } from 'react-i18next'
import { TbStepInto } from 'react-icons/tb'
import { Location, useLocation } from 'react-router-dom'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { IAccountState } from '@shared/@types/store'

import { ReceiveYourAddressContent } from './ReceivePageContent'

type TLocationState = {
  account?: IAccountState
}

export const ReceiveYourAddress = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'receive' })
  const { state } = useLocation() as Location<TLocationState>

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepInto />}>
      <ReceiveYourAddressContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')}>
      <ReceiveYourAddressContent />
    </MainLayout>
  )
}
