import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { TbAlertTriangle } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@renderer/components/IconButton'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'

type TProps = {
  currentStep: EPrepareHardwareWalletMigrationStep
}

export const PrepareHardwareWalletModalHeader = ({ currentStep }: TProps) => {
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })

  const handleClose = async () => {
    // We need to go back to prevent the user to see a blank migration page

    await navigate(-1)

    modalErase('center')
  }

  return (
    <header
      className={StyleHelper.mergeStyles('flex items-center justify-end pt-5', {
        'justify-between': currentStep === EPrepareHardwareWalletMigrationStep.CONFIRM,
      })}
    >
      {currentStep === EPrepareHardwareWalletMigrationStep.CONFIRM && (
        <p className="flex max-w-[256px] items-center gap-x-3 text-xs text-orange">
          <TbAlertTriangle aria-hidden={true} className="h-5 min-h-5 w-5 min-w-5" />

          {t('alert')}
        </p>
      )}

      <IconButton
        aria-label={t('closeIconButtonAriaLabel')}
        icon={<MdClose aria-hidden={true} className="fill-white" />}
        size="md"
        compacted
        onClick={handleClose}
      />
    </header>
  )
}
