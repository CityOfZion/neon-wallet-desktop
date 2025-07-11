import { cloneElement, ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import MdLooks3 from '@renderer/assets/images/md-looks-3.svg?react'
import MdLooks4 from '@renderer/assets/images/md-looks-4.svg?react'
import MdLooksOne from '@renderer/assets/images/md-looks-one.svg?react'
import MdLooksTwo from '@renderer/assets/images/md-looks-two.svg?react'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = ComponentProps<'div'> & {
  currentStep?: number
}

type TStepProps = {
  icon: JSX.Element
  colorSchema?: 'green' | 'blue'
  label: string
} & ComponentProps<'div'>

const Step = ({ icon, colorSchema, label, className, ...props }: TStepProps) => {
  return (
    <div
      {...props}
      className={StyleHelper.mergeStyles(
        'flex items-center gap-2.5 rounded border-l-3 border-transparent px-3.5 py-2.5 aria-selected:rounded-l-none',
        {
          'bg-green-700 text-green aria-selected:border-green': colorSchema === 'green',
          'bg-blue/10 text-blue aria-selected:border-blue': colorSchema === 'blue',
        },
        className
      )}
    >
      {cloneElement(icon, { className: 'w-6 h-6' })}
      <span className="text-sm text-white">{label}</span>
    </div>
  )
}

export const MigrateSteps = ({ className, currentStep, ...props }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'migrateSteps' })

  return (
    <div className={StyleHelper.mergeStyles('w-full', className)} {...props}>
      <span className="mb-1 block text-sm font-light text-neon">{t('inNeon2.label')}</span>

      <Step
        icon={<MdLooksOne aria-hidden={true} />}
        colorSchema="green"
        label={t('inNeon2.step1')}
        aria-selected={currentStep === 1}
      />

      <span className="mb-1 mt-5 block text-sm font-light text-blue">{t('inNeon3.label')}</span>

      <Step
        icon={<MdLooksTwo />}
        colorSchema="blue"
        label={t('inNeon3.step2')}
        className="rounded-b-none"
        aria-selected={currentStep === 2}
      />
      <Step
        icon={<MdLooks3 />}
        colorSchema="blue"
        label={t('inNeon3.step3')}
        className="rounded-none"
        aria-selected={currentStep === 3}
      />
      <Step
        icon={<MdLooks4 />}
        colorSchema="blue"
        label={t('inNeon3.step4')}
        className="rounded-t-none"
        aria-selected={currentStep === 4}
      />
    </div>
  )
}
