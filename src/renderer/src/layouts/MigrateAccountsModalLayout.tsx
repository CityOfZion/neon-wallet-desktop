import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPackageImport } from 'react-icons/tb'
import { MigrateSteps } from '@renderer/components/MigrateSteps'
import { Separator } from '@renderer/components/Separator'

import { EndModalLayout } from './EndModal'

type TProps = {
  currentStep: number
  withBackButton?: boolean
  children: React.ReactNode
  stepIcon: JSX.Element
  stepTitle: string
}

export const MigrateAccountsModalLayout = ({ currentStep, withBackButton, stepIcon, stepTitle, children }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })

  return (
    <EndModalLayout
      heading={t('title')}
      headingIcon={<TbPackageImport />}
      withBackButton={withBackButton}
      size="lg"
      contentClassName="flex p-0"
    >
      <div className="bg-gray-900/50 h-full w-[20rem] min-w-[20rem] px-4 py-10">
        <span className="text-ms text-white">{t('instructionTitle')}</span>

        <Separator className="mt-3" />

        <MigrateSteps className="mt-7" currentStep={currentStep} />
      </div>

      <div className="px-7 py-8 flex-grow flex flex-col min-w-0">
        <div className="flex w-full gap-2.5 items-center">
          {cloneElement(stepIcon, { className: 'w-6 h-6 text-blue' })}
          <span>{stepTitle}</span>
        </div>

        <Separator className="mt-3 mb-7" />

        {children}
      </div>
    </EndModalLayout>
  )
}
