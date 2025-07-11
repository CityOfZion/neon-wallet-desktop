import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router-dom'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
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

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepInto />} rightComponent={<CommonScreenActions />}>
      <ReceivePageContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <ReceivePageContent />
    </MainLayout>
  )
}
