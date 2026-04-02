import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'

import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'

import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'

import { TAccount } from '@shared/types/store'

import { SendPageContent } from './SendPageContent'

type TLocationState = {
  account?: TAccount
  recipient?: string
}

const SendPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { state } = useLocation() as Location<TLocationState>

  return state?.account || state?.recipient ? (
    <ContentLayout title={t('title')} titleIcon={<TbStepOut />} rightComponent={<CommonScreenActions />}>
      <SendPageContent account={state?.account} recipientAddress={state?.recipient} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <SendPageContent />
    </MainLayout>
  )
}

export default SendPage
