import { useTranslation } from 'react-i18next'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import NeonWalletLogo from '@renderer/assets/images/neon-wallet-full.svg?react'
import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { LATEST_RELEASE_URL } from '@renderer/constants/urls'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import 'github-markdown-css/github-markdown.css'

export const AutoUpdateNotes = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'autoUpdate.notes' })
  const { t: changelogT } = useTranslation('changelog')
  const { modalNavigateWrapper } = useModalNavigate()

  const releaseNotes = changelogT('notes', { returnObjects: true })
  const latestRelease = releaseNotes[0]

  return (
    <CenterModalLayout contentClassName="flex flex-col w-full items-center justify-between">
      <div className="flex min-h-0 w-full flex-grow flex-col items-center">
        <NeonWalletLogo aria-hidden={true} className="h-min w-56" />

        <h2 className="mt-11 text-2xl text-white">{t('title')}</h2>

        <div className="mt-8 flex min-h-0 w-full flex-col items-start">
          <p className="text-sm text-white">{t('subtitle')}</p>
          <Separator className="mt-3" />

          <div key={latestRelease.version} className="my-7 min-h-0 w-full overflow-auto">
            <span className="mb-1 block text-xs text-gray-300">{latestRelease.date}</span>
            <span className="mb-2 block text-lg text-white">
              {changelogT('versionLabel', { version: latestRelease.version })}
            </span>

            <ul>
              {latestRelease.changes.map((item, index) => (
                <li key={`changelog-item-${index}`} className="list-inside list-disc text-xs text-gray-100">
                  {item}
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
