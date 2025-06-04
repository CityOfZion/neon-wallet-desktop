import { useTranslation } from 'react-i18next'
import { Outlet, useMatch } from 'react-router-dom'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { Separator } from '@renderer/components/Separator'
import { SidebarMenuButton } from '@renderer/components/SidebarMenuButton'
import { MainLayout } from '@renderer/layouts/Main'

export const PortfolioPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio' })

  const matchRoot = useMatch('app/portfolio')

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />} contentClassName="flex-row gap-x-3">
      <section className="flex w-full min-w-[11.625rem] max-w-[11.625rem] flex-col rounded bg-gray-800 drop-shadow-lg">
        <div className="px-4 text-sm">
          <p className="py-3">{t('allAccounts')}</p>
          <Separator />
        </div>
        <ul className="w-full max-w-full">
          <SidebarMenuButton title={t('overview')} to="/app/portfolio/overview" match={!!matchRoot} />
          <SidebarMenuButton title={t('allActivity')} to="/app/portfolio/activity" />
          <SidebarMenuButton title={t('allConnections')} to="/app/portfolio/connections" />
        </ul>
      </section>
      <Outlet />
    </MainLayout>
  )
}
