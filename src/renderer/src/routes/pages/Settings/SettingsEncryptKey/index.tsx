import { ChangeEvent } from 'react'

import { hasEncryption } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { PasswordHelper } from '@renderer/helpers/PasswordHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SettingsLayout } from '@renderer/layouts/Settings'

import MdOutlineKey from '@renderer/assets/images/md-outline-key.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { SettingsEncryptInputStep } from './SettingsEncryptInputStep'
import { SettingsEncryptKeySuccessContent } from './SettingsEncryptKeySuccessContent'

type PassphraseField = 'passphrase' | 'confirmationPassphrase'

type TFormData = {
  privateKey: string
  passphrase: string
  confirmationPassphrase: string
}

const SettingsEncryptKeyPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings' })
  const { modalNavigate } = useModalNavigate()

  const { handleAct, setError, actionState, actionData, setData, clearErrors, reset } = useActions<TFormData>({
    privateKey: '',
    passphrase: '',
    confirmationPassphrase: '',
  })

  const validatePassphraseField = (
    value: string,
    passphraseField: PassphraseField,
    comparablePassphraseField: PassphraseField
  ) => {
    setData({ [passphraseField]: value })

    const trimmedValue = value.trim()
    const comparablePassphraseValue = actionData[comparablePassphraseField]

    if (trimmedValue.length < PasswordHelper.minimumPasswordLength)
      setError(
        passphraseField,
        t(`encryptKey.error.${passphraseField}IsInvalid`, { chars: PasswordHelper.minimumPasswordLength })
      )
    else if (comparablePassphraseValue && value !== comparablePassphraseValue)
      setError(passphraseField, t(`encryptKey.error.${passphraseField}IsDifferent`))
    else clearErrors(comparablePassphraseField)
  }

  const handlePrivateKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = StringHelper.removeSpecialCharacters(event.target.value, { allowSpaces: false })

    setData({ privateKey: value })

    if (!BlockchainServiceHelper.bsAggregator.validateKeyAllBlockchains(value))
      setError('privateKey', t('encryptKey.error.privateKey'))
  }

  const handlePassphraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    validatePassphraseField(event.target.value, 'passphrase', 'confirmationPassphrase')
  }

  const handleConfirmationPassphraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    validatePassphraseField(event.target.value, 'confirmationPassphrase', 'passphrase')
  }

  const handleSelect = async (blockchain: TBlockchainServiceKey) => {
    modalNavigate(-1)

    try {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

      if (!hasEncryption(service)) {
        ToastHelper.error({ message: t('encryptKey.error.blockchainCanNotEncryptKey') })

        return
      }

      const encryptedKey = await service.encrypt(actionData.privateKey, actionData.passphrase)

      modalNavigate('success', {
        state: {
          heading: t('encryptKey.successModal.title'),
          headingIcon: <MdOutlineKey aria-hidden />,
          content: <SettingsEncryptKeySuccessContent encryptedKey={encryptedKey} />,
          subtitle: t('encryptKey.successModal.subtitle'),
        },
      })

      reset()
    } catch (error) {
      LoggerHelper.error(error, { where: 'SettingsEncryptKeyPage', operation: 'encrypt' })
      ToastHelper.error({ message: AppError.wrap(error, t('encryptKey.error.errorToEncryptKey')).displayMessage })
    }
  }

  const handleSubmit = async () => {
    modalNavigate('blockchain-selection', {
      state: {
        heading: t('encryptKey.successModal.title'),
        headingIcon: <MdOutlineKey aria-hidden />,
        withBackButton: false,
        onSelect: handleSelect,
      },
    })
  }

  return (
    <SettingsLayout title={t('securityOption.encryptKey')}>
      <form className="flex grow flex-col items-center text-xs" onSubmit={handleAct(handleSubmit)}>
        <div className="flex w-full max-w-[24rem] grow flex-col">
          <h2 className="mb-6 text-center text-gray-100">{t('encryptKey.subtitle')}</h2>

          <div className="flex flex-col gap-4">
            <SettingsEncryptInputStep
              step={1}
              pastable
              description={t('encryptKey.titleInput1')}
              placeholder={t('encryptKey.inputPrivateKeyPlaceholder')}
              value={actionData.privateKey}
              errorMessage={actionState.errors.privateKey}
              onChange={handlePrivateKeyChange}
            />

            <SettingsEncryptInputStep
              step={2}
              description={t('encryptKey.titleInput2')}
              placeholder={t('encryptKey.inputPassphrasePlaceholder')}
              type="password"
              value={actionData.passphrase}
              errorMessage={actionState.errors.passphrase}
              onChange={handlePassphraseChange}
            />

            <SettingsEncryptInputStep
              step={3}
              description={t('encryptKey.titleInput3')}
              placeholder={t('encryptKey.inputConfirmPassphrasePlaceholder')}
              type="password"
              value={actionData.confirmationPassphrase}
              errorMessage={actionState.errors.confirmationPassphrase}
              withLine={false}
              onChange={handleConfirmationPassphraseChange}
            />
          </div>
        </div>

        <Button
          className="w-full max-w-62.5"
          type="submit"
          label={t('encryptKey.buttonGenerate')}
          loading={actionState.isActing}
          disabled={!actionState.isValid}
          leftIcon={<MdOutlineKey aria-hidden />}
        />
      </form>
    </SettingsLayout>
  )
}

export default SettingsEncryptKeyPage
