import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'

import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'

import TbReplace from '@renderer/assets/images/tb-replace.svg?react'

import { IAccountState } from '@shared/@types/store'

import { SwapPageContent } from './SwapPageContent'

type TLocationState = {
  account?: IAccountState
}

const SwapPage = () => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'swap' })

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbReplace aria-hidden />} rightComponent={<CommonScreenActions />}>
      <SwapPageContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <SwapPageContent />
    </MainLayout>
  )
}

export default SwapPage
