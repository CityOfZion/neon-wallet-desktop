import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router-dom'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { MainLayout } from '@renderer/layouts/Main'
import { IAccountState } from '@shared/@types/store'

import { Neo3NeoXBridgeContent } from './Neo3NeoXBridgeContent'

type TLocationState = {
  account?: IAccountState
}

export const Neo3NeoXBridgePage = () => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'neo3NeoXBridge' })

  return state?.account ? (
    <ContentLayout title={t('title')} titleIcon={<TbReplace aria-hidden />} rightComponent={<CommonScreenActions />}>
      <Neo3NeoXBridgeContent account={state?.account} />
    </ContentLayout>
  ) : (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />}>
      <Neo3NeoXBridgeContent />
    </MainLayout>
  )
}
