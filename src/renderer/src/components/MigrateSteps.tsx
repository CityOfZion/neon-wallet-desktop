import { cloneElement, ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLooks3, MdLooks4, MdLooksOne, MdLooksTwo } from 'react-icons/md'
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
        'flex gap-2.5 py-2.5 px-3.5 items-center rounded aria-selected:rounded-l-none border-transparent border-l-3',
        {
          'text-green bg-green-700 aria-selected:border-green': colorSchema === 'green',
          'text-blue bg-blue/10 aria-selected:border-blue': colorSchema === 'blue',
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
      <span className="text-neon text-sm mb-1 block font-light">{t('inNeon2.label')}</span>

      <Step icon={<MdLooksOne />} colorSchema="green" label={t('inNeon2.step1')} aria-selected={currentStep === 1} />

      <span className="text-blue block text-sm mb-1 mt-5 font-light">{t('inNeon3.label')}</span>

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
