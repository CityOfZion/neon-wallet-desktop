import { useTranslation } from 'react-i18next'
import PiSealCheck from '@renderer/assets/images/pi-seal-check.svg?react'

export const ChangePasswordStep3 = (): JSX.Element => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.changePassword.step3' })

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-5 pb-10">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-asphalt">
          <PiSealCheck aria-hidden={true} className="h-[7rem] w-[7rem] text-blue" />
        </div>
        <span className="w-80 text-center text-lg">{t('subtitle')}</span>
      </div>
    </div>
  )
}
