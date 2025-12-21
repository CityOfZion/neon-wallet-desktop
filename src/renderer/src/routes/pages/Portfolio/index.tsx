import { cloneElement } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useLocation, useOutlet } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { MenuLink } from '@renderer/components/MenuLink'
import { Separator } from '@renderer/components/Separator'

import { MainLayout } from '@renderer/layouts/Main'

const PortfolioPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'portfolio' })
  const outlet = useOutlet()

  const { pathname } = useLocation()

  return (
    <MainLayout heading={t('title')} rightComponent={<CommonScreenActions />} contentClassName="flex-row gap-x-3">
      <section className="flex w-full max-w-46.5 min-w-46.5 flex-col rounded-sm bg-gray-800 drop-shadow-lg">
        <div className="px-4 text-sm">
          <p className="py-3">{t('allAccounts')}</p>
          <Separator />
        </div>
        <ul className="w-full max-w-full">
          <li>
            <MenuLink layoutId="portfolio-menu-link" to="/portfolio/overview">
              {t('overview')}
            </MenuLink>

            <Separator containerClassName="px-3" />
          </li>

          <li>
            <MenuLink layoutId="portfolio-menu-link" to="/portfolio/activity">
              {t('allActivity')}
            </MenuLink>

            <Separator containerClassName="px-3" />
          </li>

          <li>
            <MenuLink layoutId="portfolio-menu-link" to="/portfolio/connections">
              {t('allConnections')}
            </MenuLink>
          </li>
        </ul>
      </section>

      <section className="h-full w-full rounded-sm bg-gray-800 px-4 py-3 shadow-lg">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.1 }}
            className="flex h-full w-full min-w-0 flex-col"
          >
            {outlet && cloneElement(outlet)}
          </motion.div>
        </AnimatePresence>
      </section>
    </MainLayout>
  )
}

export default PortfolioPage
