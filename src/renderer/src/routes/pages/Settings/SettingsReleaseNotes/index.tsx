import { useTranslation } from 'react-i18next'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import { Link } from '@renderer/components/Link'
import { SettingsLayout } from '@renderer/layouts/Settings'

import 'github-markdown-css/github-markdown.css'

export const SettingsReleaseNotesPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsReleaseNotes' })
  const { t: changelogT } = useTranslation('changelog')

  const releaseNotes = changelogT('notes', { returnObjects: true })

  return (
    <SettingsLayout title={t('title')} contentClassName="overflow-y-auto">
      <ul className="flex flex-col gap-10">
        {releaseNotes.map(item => (
          <li key={item.version}>
            <span className="mb-1 block text-xs text-gray-300">{item.date}</span>
            <span className="mb-2 block text-lg text-white">
              {changelogT('versionLabel', { version: item.version })}
            </span>

            <ul>
              {item.changes.map((item, index) => (
                <li key={`changelog-item-${index}`} className="list-inside list-disc text-xs text-gray-100">
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
                  rightIcon={<MdLaunch />}
                  variant="outlined"
                  clickableProps={{ className: 'h-10' }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </SettingsLayout>
  )
}
