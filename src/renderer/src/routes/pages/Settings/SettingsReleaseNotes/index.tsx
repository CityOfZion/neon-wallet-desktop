import { useTranslation } from 'react-i18next'
import { MdLaunch } from 'react-icons/md'
import Markdown from 'react-markdown'
import { Link } from '@renderer/components/Link'
import { SettingsLayout } from '@renderer/layouts/Settings'
import rehypeRaw from 'rehype-raw'

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
            <span className="text-gray-300 block text-xs mb-1">{item.date}</span>
            <span className="text-white block text-lg mb-2">
              {changelogT('versionLabel', { version: item.version })}
            </span>

            <ul>
              {item.changes.map((item, index) => (
                <li key={`changelog-item-${index}`} className="list-disc list-inside text-white">
                  <Markdown
                    className="markdown-body bg-transparent font-sans inline-block text-xs"
                    rehypePlugins={[rehypeRaw]}
                  >
                    {item}
                  </Markdown>
                </li>
              ))}
            </ul>

            {item.url && (
              <div className="w-40 mt-6">
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
