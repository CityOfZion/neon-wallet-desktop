import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { TbPackageImport } from 'react-icons/tb'
import { MigrateSteps } from '@renderer/components/MigrateSteps'
import { Separator } from '@renderer/components/Separator'

import { SideModalLayout } from './SideModal'

type TProps = {
  currentStep: number
  withBackButton?: boolean
  children: React.ReactNode
  stepIcon: JSX.Element
  stepTitle: string
}

export const MigrateAccountsModalLayout = ({ currentStep, stepIcon, stepTitle, children }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets' })

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbPackageImport aria-hidden={true} />}
      contentClassName="flex p-0"
    >
      <div className="h-full w-[20rem] min-w-[20rem] bg-gray-900/50 px-4 py-10">
        <span className="text-ms text-white">{t('instructionTitle')}</span>

        <Separator className="mt-3" />

        <MigrateSteps className="mt-7" currentStep={currentStep} />
      </div>

      <div className="flex min-w-0 flex-grow flex-col px-7 py-8">
        <div className="flex w-full items-center gap-2.5">
          {cloneElement(stepIcon, { className: 'w-6 h-6 text-blue' })}
          <span>{stepTitle}</span>
        </div>

        <Separator className="mb-7 mt-3" />

        {children}
      </div>
    </SideModalLayout>
  )
}
