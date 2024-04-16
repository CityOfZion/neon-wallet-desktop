import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineKey } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { SettingsLayout } from '@renderer/layouts/Settings'
import { bsAggregator } from '@renderer/libs/blockchainService'

import { SettingsEncryptInputStep } from './SettingsEncryptInputStep'
import { SettingsEncryptKeySuccessContent } from './SettingsEncryptKeySuccessContent'

type TFormData = {
  privateKey: string
  passphrase: string
  confirmationPassphrase: string
}

const MIN_LENGTH_PASSPHRASE = 4

export const SettingsEncryptKeyPage = (): JSX.Element => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const { modalNavigate } = useModalNavigate()

  const { handleAct, setError, actionState, actionData, setData, reset } = useActions<TFormData>({
    privateKey: '',
    passphrase: '',
    confirmationPassphrase: '',
  })

  const handlePrivateKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({
      privateKey: value,
    })

    if (!bsAggregator.validateKeyAllBlockchains(value)) {
      setError('privateKey', t('encryptKey.error.privateKey'))
      return
    }
  }
  const handlePassphraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({
      passphrase: value,
    })

    if (value.length < MIN_LENGTH_PASSPHRASE) {
      setError('passphrase', t('encryptKey.error.passphrase'))
      return
    }
  }
  const handleConfirmationPassphraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setData({
      confirmationPassphrase: value,
    })

    if (actionData.passphrase !== value) {
      setError('confirmationPassphrase', t('encryptKey.error.confirmationPassphrase'))
      return
    }
  }

  const handleSubmit = async (data: TFormData) => {
    const serviceName = bsAggregator.getBlockchainNameByKey(data.privateKey)
    if (!serviceName) {
      setError('privateKey', t('encryptKey.error.privateKeyNotFound'))
      return
    }

    const service = bsAggregator.blockchainServicesByName[serviceName]
    const encryptedKey = await service.encrypt(data.privateKey, data.passphrase)

    modalNavigate('success', {
      state: {
        heading: t('encryptKey.successModal.title'),
        headingIcon: <MdOutlineKey />,
        content: <SettingsEncryptKeySuccessContent encryptedKey={encryptedKey} />,
        subtitle: t('encryptKey.successModal.subtitle'),
      },
    })

    reset()
  }

  return (
    <SettingsLayout title={t('securityOption.encryptKey')}>
      <form className="flex flex-col items-center text-xs flex-grow" onSubmit={handleAct(handleSubmit)}>
        <div className="max-w-[22.5rem] w-full flex flex-grow flex-col">
          <span className="text-gray-100 text-center mb-6">{t('encryptKey.subtitle')}</span>

          <div className="flex flex-col gap-4">
            <SettingsEncryptInputStep
              step={1}
              description={t('encryptKey.titleInput1')}
              placeholder={t('encryptKey.inputPrivateKeyPlaceholder')}
              onChange={handlePrivateKeyChange}
              value={actionData.privateKey}
              errorMessage={actionState.errors.privateKey}
            />

            <SettingsEncryptInputStep
              step={2}
              description={t('encryptKey.titleInput2')}
              placeholder={t('encryptKey.inputPassphrasePlaceholder')}
              type="password"
              onChange={handlePassphraseChange}
              value={actionData.passphrase}
              errorMessage={actionState.errors.passphrase}
            />

            <SettingsEncryptInputStep
              step={3}
              description={t('encryptKey.titleInput2')}
              placeholder={t('encryptKey.inputConfirmPassphrasePlaceholder')}
              onChange={handleConfirmationPassphraseChange}
              type="password"
              value={actionData.confirmationPassphrase}
              errorMessage={actionState.errors.confirmationPassphrase}
              withLine={false}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            className="w-fit"
            type="submit"
            label={t('encryptKey.buttonGenerate')}
            loading={actionState.isActing}
            disabled={!actionState.isValid}
            leftIcon={<MdOutlineKey />}
          />
        </div>
      </form>
    </SettingsLayout>
  )
}
