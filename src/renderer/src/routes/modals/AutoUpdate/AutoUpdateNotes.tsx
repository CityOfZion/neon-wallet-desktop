import { useTranslation } from 'react-i18next'
import { MdLaunch, MdOutlineAutoAwesome } from 'react-icons/md'
import Markdown from 'react-markdown'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { LATEST_RELEASE_URL } from '@renderer/constants/urls'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import rehypeRaw from 'rehype-raw'

import 'github-markdown-css/github-markdown.css'

export const AutoUpdateNotes = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'autoUpdate.notes' })
  const { t: changelogT } = useTranslation('changelog')
  const { modalNavigateWrapper } = useModalNavigate()

  const releaseNotes = changelogT('notes', { returnObjects: true })
  const latestRelease = releaseNotes[0]

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between">
      <div className="flex flex-col items-center w-full min-h-0 flex-grow">
        <NeonWalletLogo className="w-56 h-min" />
        <h2 className="text-2xl text-white mt-11">{t('title')}</h2>

        <div className="w-full flex flex-col items-start mt-8 min-h-0">
          <p className="text-sm text-white">{t('subtitle')}</p>
          <Separator className="mt-3" />

          <div key={latestRelease.version} className="my-7 overflow-auto min-h-0 w-full">
            <span className="text-gray-300 block text-xs mb-1">{latestRelease.date}</span>
            <span className="text-white block text-lg mb-2">
              {changelogT('versionLabel', { version: latestRelease.version })}
            </span>

            <ul>
              {latestRelease.changes.map((item, index) => (
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
          </div>
        </div>
      </div>

      <div className="flex w-full justify-center gap-x-2">
        <Link
          to={LATEST_RELEASE_URL}
          target="_blank"
          label={t('buttonLearnMoreLabel')}
          rightIcon={<MdLaunch />}
          colorSchema="gray"
          wide
          iconsOnEdge={false}
        />
        <Button
          label={t('buttonContinueLabel')}
          iconsOnEdge={false}
          wide
          rightIcon={<MdOutlineAutoAwesome />}
          onClick={modalNavigateWrapper('auto-update-mobile')}
        />
      </div>
    </CenterModalLayout>
  )
}
