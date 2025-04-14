import { useTranslation } from 'react-i18next'
import { MdAdd } from 'react-icons/md'
import { TbFileExport, TbFileImport } from 'react-icons/tb'
import { Outlet, useMatch } from 'react-router-dom'
import { HelpButton } from '@renderer/components/HelpButton'
import { IconButton } from '@renderer/components/IconButton'
import { NotificationsButton } from '@renderer/components/NotificationsButton'
import { Separator } from '@renderer/components/Separator'
import { SidebarMenuButton } from '@renderer/components/SidebarMenuButton'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { MainLayout } from '@renderer/layouts/Main'

export const PortfolioPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio' })
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const { modalNavigateWrapper } = useModalNavigate()

  const matchRoot = useMatch('app/portfolio')

  return (
    <MainLayout
      heading={t('title')}
      rightComponent={
        <div className="flex gap-x-2">
          <NotificationsButton />

          <IconButton
            icon={<MdAdd aria-hidden />}
            size="md"
            text={t('newWalletButtonLabel')}
            onClick={modalNavigateWrapper('create-wallet-step-1')}
            disabled={currentLoginSession?.type !== 'password'}
            {...TestHelper.buildTestObject('portfolio-new-wallet-button')}
          />

          <IconButton
            icon={<TbFileImport aria-hidden />}
            size="md"
            text={t('importButtonLabel')}
            onClick={modalNavigateWrapper('import')}
          />

          <IconButton icon={<TbFileExport aria-hidden />} size="md" text={t('exportButtonLabel')} disabled />

          <HelpButton />
        </div>
      }
      contentClassName="flex-row gap-x-3"
    >
      <section className="bg-gray-800 rounded drop-shadow-lg max-w-[11.625rem] min-w-[11.625rem] w-full flex flex-col">
        <div className="text-sm px-4">
          <p className="py-3">{t('allAccounts')}</p>
          <Separator />
        </div>
        <ul className="max-w-full w-full">
          <SidebarMenuButton title={t('overview')} to="/app/portfolio/overview" match={!!matchRoot} />
          <SidebarMenuButton title={t('allActivity')} to="/app/portfolio/activity" />
          <SidebarMenuButton title={t('allConnections')} to="/app/portfolio/connections" />
        </ul>
      </section>
      <Outlet />
    </MainLayout>
  )
}
