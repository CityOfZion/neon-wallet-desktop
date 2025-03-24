import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowRight } from 'react-icons/tb'
import { Button, TButtonProps } from '@renderer/components/Button'
import { Stepper } from '@renderer/components/Stepper'

type TProps = {
  currentStep: number
  buttonProps?: TButtonProps
  children: ReactNode
}

export const PrepareHardwareWalletContainer = ({ currentStep, buttonProps, children }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })

  return (
    <div className="flex flex-col items-center w-full mx-auto gap-y-4 h-full max-w-[600px]">
      <p className="bg-black rounded-full text-center py-2 px-6 text-gray-100 font-light">
        {t('labels.hardwareWallet')}
      </p>

      <Stepper
        className="w-full max-w-[460px] mt-4 mb-14"
        textClassName="w-16"
        currentStep={currentStep}
        steps={t('steps', { returnObjects: true })}
      />

      {children}

      <div className="flex flex-grow flex-col justify-end mt-8 pb-8">
        <Button
          variant="contained"
          colorSchema="neon"
          iconsOnEdge={false}
          clickableProps={{ className: 'px-16' }}
          rightIcon={<TbArrowRight aria-hidden={true} />}
          {...buttonProps}
        />
      </div>
    </div>
  )
}
