import { useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'

import { DateHelper } from '@renderer/helpers/DateHelper'

import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { SettingsLayout } from '@renderer/layouts/Settings'

import TbExternalLink from '@renderer/assets/images/tb-external-link.svg?react'

import 'github-markdown-css/github-markdown.css'

const SettingsReleaseNotesPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsReleaseNotes' })
  const { t: tChangelog } = useTranslation('changelog')
  const { language } = useLanguageSelector()

  const releaseNotes = tChangelog('notes', { returnObjects: true })
  const sortedReleaseNotes = releaseNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <SettingsLayout title={t('title')} contentClassName="overflow-y-auto ">
      <ul className="flex flex-col">
        {sortedReleaseNotes.map(item => (
          <li key={item.version} className="group">
            <div>
              <span className="mb-1 block text-xs text-gray-300">
                {DateHelper.formatLocalized(item.date, { language, format: 'PPP' })}
              </span>

              <span className="mb-2 block text-lg text-white">
                {tChangelog('versionLabel', { version: item.version })}
              </span>

              <ul>
                {item.changes.map((item, index) => (
                  <li key={`changelog-item-${index}`} className="list-inside list-disc py-0.5 text-xs text-gray-100">
                    {item}
                  </li>
                ))}
              </ul>

              {item.url && (
                <div className="mt-6 w-40">
                  <Link
                    target="_blank"
                    to={item.url}
                    label={t('button.learnMore')}
                    rightIcon={<TbExternalLink />}
                    variant="outlined"
                    clickableProps={{ className: 'h-10' }}
                  />
                </div>
              )}
            </div>

            <Separator containerClassName="group-last:hidden py-5" />
          </li>
        ))}
      </ul>
    </SettingsLayout>
  )
}

export default SettingsReleaseNotesPage
