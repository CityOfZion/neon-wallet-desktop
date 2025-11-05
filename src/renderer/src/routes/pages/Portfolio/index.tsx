import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { Separator } from '@renderer/components/Separator'
import { SidebarMenuButton } from '@renderer/components/SidebarMenuButton'

import { MainLayout } from '@renderer/layouts/Main'

const PortfolioPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio' })

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />} contentClassName="flex-row gap-x-3">
      <section className="flex w-full max-w-46.5 min-w-46.5 flex-col rounded-sm bg-gray-800 drop-shadow-lg">
        <div className="px-4 text-sm">
          <p className="py-3">{t('allAccounts')}</p>
          <Separator />
        </div>
        <ul className="w-full max-w-full">
          <SidebarMenuButton title={t('overview')} to="/portfolio/overview" />
          <SidebarMenuButton title={t('allActivity')} to="/portfolio/activity" />
          <SidebarMenuButton title={t('allConnections')} to="/portfolio/connections" />
        </ul>
      </section>

      <section className="flex h-full w-full min-w-0 flex-col rounded-sm bg-gray-800 px-4 py-3 shadow-lg">
        <Outlet />
      </section>
    </MainLayout>
  )
}

export default PortfolioPage
