import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { MdInfoOutline, MdLaunch, MdLooks3, MdLooksOne, MdLooksTwo } from 'react-icons/md'
import { AlertErrorBanner } from '@renderer/components/AlertErrorBanner'
import { Link } from '@renderer/components/Link'
import { Separator } from '@renderer/components/Separator'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { match } from 'ts-pattern'

export const MigrationNeo3SideBar = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'migrationNeo3.sideBar' })

  const steps = t('steps', { returnObjects: true })

  return (
    <div className="flex flex-col w-[26%] max-w-[24rem] bg-gray-900/50 px-4 border-r border-gray-300/15">
      <div className="flex gap-2.5 items-center h-12">
        <MdInfoOutline aria-hidden={true} className="w-6 h-6 text-green" />

        <h2 className="text-white text-sm">{t('title')}</h2>
      </div>

      <Separator containerClassName="mb-3" />

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const icon = match(index)
          .with(0, () => <MdLooksOne />)
          .with(1, () => <MdLooksTwo />)
          .otherwise(() => <MdLooks3 />)

        return (
          <div key={index} className="flex flex-col gap-y-3 mt-3">
            <div className="flex gap-x-3">
              {cloneElement(icon, {
                ...icon.props,
                'aria-hidden': true,
                className: 'text-blue h-6 w-6 min-h-6 min-w-6',
              })}

              <p className="text-xs text-white mt-1">{step}</p>
            </div>

            {!isLast && <Separator />}
          </div>
        )
      })}

      <div className="mt-8 w-full flex flex-grow items-end">
        <p className="text-xs text-gray-100 italic">{t('fee')}</p>
      </div>

      <AlertErrorBanner
        message={t('alert')}
        className="mt-8 bg-magenta-700/50 gap-3 p-3"
        messageClassName="font-normal text-xs leading-4"
        iconClassName="self-start"
      />

      <div className="flex w-full mb-8 mt-12">
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
          rightIcon={<MdLaunch aria-hidden={true} />}
        />
      </div>
    </div>
  )
}
