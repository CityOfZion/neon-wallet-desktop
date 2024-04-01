import { useTranslation } from 'react-i18next'
import { MdLaunch } from 'react-icons/md'
import Markdown from 'react-markdown'
import releaseNotes from '@renderer/assets/release-notes.json'
import { Link } from '@renderer/components/Link'
import { SettingsLayout } from '@renderer/layouts/Settings'
import rehypeRaw from 'rehype-raw'

import 'github-markdown-css/github-markdown.css'

export const SettingsReleaseNotesPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsReleaseNotes' })

  return (
    <SettingsLayout title={t('title')} contentClassName="overflow-y-auto">
      <ul className="flex flex-col gap-10">
        {releaseNotes.map(item => (
          <li key={item.tag_name}>
            <span className="text-gray-300 block text-xs mb-1">{item.published_at}</span>
            <span className="text-white block text-lg mb-2">{item.tag_name}</span>
            <p className="markdown-body bg-transparent text-xs text-white">
              <Markdown rehypePlugins={[rehypeRaw]}>{item.body}</Markdown>
            </p>

            {item.html_url && (
              <div className="w-40 mt-6">
                <Link
                  target="_blank"
                  to={item.html_url}
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
