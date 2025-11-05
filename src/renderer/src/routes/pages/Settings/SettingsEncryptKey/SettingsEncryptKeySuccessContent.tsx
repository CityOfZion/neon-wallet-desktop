import { useTranslation } from 'react-i18next'

import { Input } from '@renderer/components/Input'

import MdLock from '@renderer/assets/images/md-lock.svg?react'

type TProps = {
  encryptedKey: string
}

export const SettingsEncryptKeySuccessContent = ({ encryptedKey }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.encryptKey' })

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-y-4">
      <p className="text-gray-300">{t('successModal.description')}</p>

      <Input
        leftIcon={<MdLock aria-hidden className="h-6 w-6 text-gray-300/50" />}
        value={encryptedKey}
        copyable
        readOnly
      />
    </div>
  )
}
