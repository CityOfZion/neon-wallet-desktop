import { cloneElement, type JSX, type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { NeonMigrateSteps } from '@renderer/components/NeonMigrateSteps'
import { Separator } from '@renderer/components/Separator'

import TbPackageImport from '@renderer/assets/images/tb-package-import.svg?react'

import type { TSideModalSize } from './SideModal'
import { SideModalLayout } from './SideModal'

type TProps = {
  heading: string
  children: ReactNode
  size?: TSideModalSize
  step?: number
  stepIcon?: JSX.Element
  stepTitle?: string
}

export const ImportModalLayout = ({ heading, children, size = 'md', step, stepIcon, stepTitle }: TProps) => {
  const { t } = useTranslation('layouts', { keyPrefix: 'importModal' })

  return (
    <SideModalLayout
      heading={heading}
      headingIcon={<TbPackageImport aria-hidden />}
      contentClassName="flex p-0"
      size={size}
    >
      {step && (
        <div className="h-full w-80 min-w-80 bg-gray-900/50 px-4 py-10">
          <span className="text-ms text-white">{t('instructionsTitle')}</span>

          <Separator className="mt-3" />

          <NeonMigrateSteps className="mt-7" step={step} />
        </div>
      )}

      <div className="flex min-w-0 grow flex-col px-7 py-8">
        {stepIcon && stepTitle && (
          <>
            <div className="flex w-full items-center gap-2.5">
              {cloneElement(stepIcon, { className: 'size-6 text-blue' })}
              <span>{stepTitle}</span>
            </div>

            <Separator className="mt-3 mb-7" />
          </>
        )}

        {children}
      </div>
    </SideModalLayout>
  )
}
