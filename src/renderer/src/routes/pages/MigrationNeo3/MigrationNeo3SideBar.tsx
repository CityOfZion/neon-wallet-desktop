import { cloneElement } from 'react'

import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import MdLaunch from '@renderer/assets/images/md-launch.svg?react'
import MdLooks3 from '@renderer/assets/images/md-looks-3.svg?react'
import MdLooksOne from '@renderer/assets/images/md-looks-one.svg?react'
import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'

import { DISCORD_LINK } from '@renderer/constants/urls'

export const MigrationNeo3SideBar = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'migrationNeo3.sideBar' })

  const steps = t('steps', { returnObjects: true })

  return (
    <div className="flex w-[26%] max-w-[24rem] flex-col border-r border-gray-300/15 bg-gray-900/50 px-4">
      <div className="flex h-12 items-center gap-2.5">
        <MdInfoOutline aria-hidden className="text-green h-6 w-6" />

        <h2 className="text-sm text-white">{t('title')}</h2>
      </div>

      <Separator containerClassName="mb-3" />

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const icon = match(index)
          .with(0, () => <MdLooksOne />)
          .with(1, () => <MdLooksTwo />)
          .otherwise(() => <MdLooks3 />)

        return (
          <div key={index} className="mt-3 flex flex-col gap-y-3">
            <div className="flex gap-x-3">
              {cloneElement(icon, {
                ...icon.props,
                'aria-hidden': true,
                className: 'text-blue h-6 w-6 min-h-6 min-w-6',
              })}

              <p className="mt-1 text-xs text-white">{step}</p>
            </div>

            {!isLast && <Separator />}
          </div>
        )
      })}

      <div className="mt-8 flex w-full grow items-end">
        <p className="text-xs text-gray-100 italic">{t('fee')}</p>
      </div>

      <AlertErrorBanner
        message={t('alert')}
        className="bg-magenta-700/50 mt-8 gap-3 p-3"
        messageClassName="font-normal text-xs leading-4"
        iconClassName="self-start"
      />

      <div className="mt-12 mb-8 flex w-full">
        <Link
          label={t('buttons.help')}
          to={DISCORD_LINK}
          target="_blank"
          colorSchema="neon"
          variant="outlined"
          className="mx-auto"
          textClassName="font-normal"
          flat
          wide
          iconsOnEdge={false}
          rightIcon={<MdLaunch aria-hidden />}
        />
      </div>
    </div>
  )
}
