import { ChangeEvent } from 'react'

import { hasEncryption } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { LoggerHelper } from '@renderer/helpers/LoggerHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TModalState } from '@shared/types/modal'

type TFormData = {
  password: string
}

const DecryptKeyModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'decryptKey' })
  const { blockchain, encryptedKey, onDecrypt } = useModalState<TModalState<'decrypt-key'>>()

  const { actionData, setData, actionState, handleAct, reset } = useActions<TFormData>({
    password: '',
  })

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData({ password: event.target.value })
  }

  const handleSubmit = async () => {
    try {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

      if (!hasEncryption(service)) {
        ToastHelper.error({ message: t('errors.noEncryptionInterfaceError') })

        return
      }

      const { address, key } = await service.decrypt(encryptedKey, actionData.password)

      await onDecrypt?.(key, address)
    } catch (error) {
      LoggerHelper.error(error, { where: 'DecryptKeyModal', operation: 'decrypt' })
      ToastHelper.error({ message: AppError.wrap(error, t('errors.decryptError')).displayMessage })
    } finally {
      reset()
    }
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbFileImport aria-hidden />} contentClassName="flex flex-col">
      <p>{t('description')}</p>

      <form className="mt-4 flex grow flex-col justify-between" onSubmit={handleAct(handleSubmit)}>
        <Input
          compacted
          clearable
          placeholder={t('inputPlaceholder')}
          value={actionData.password}
          onChange={handlePasswordChange}
          type="password"
        />

        <Button
          className="mt-8"
          type="submit"
          label={t('buttonContinueLabel')}
          flat
          disabled={!actionState.isValid}
          loading={actionState.isActing}
        />
      </form>
    </SideModalLayout>
  )
}

export default DecryptKeyModal
