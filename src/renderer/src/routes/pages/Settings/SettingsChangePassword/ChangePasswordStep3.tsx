import { useTranslation } from 'react-i18next'
import { PiSealCheck } from 'react-icons/pi'

export const ChangePasswordStep3 = (): JSX.Element => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step3' })

  return (
    <div className="w-full px-5 flex flex-col h-full items-center justify-center pb-10">
      <div className="flex flex-col items-center gap-5">
        <div className="w-36 h-36 rounded-full bg-asphalt flex items-center justify-center">
          <PiSealCheck className="text-blue w-[7rem] h-[7rem]" />
        </div>
        <span className="text-lg w-80 text-center">{t('subtitle')}</span>
      </div>
    </div>
  )
}
