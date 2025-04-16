import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MnemonicHelper } from '@renderer/helpers/MnemonicHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TUseImportActionInputType } from '@shared/@types/hooks'

import { useActions } from './useActions'

type TFormData = {
  text: string
  inputType?: TUseImportActionInputType
}

type TImportActionOptions = {
  verifyIfAddressAlreadyExists?: boolean
}

export const useImportAction = (
  submitByInputType: Partial<
    Record<TUseImportActionInputType, (value: string, inputType: TUseImportActionInputType) => Promise<void>>
  >,
  options: TImportActionOptions = {}
) => {
  const { verifyIfAddressAlreadyExists = true } = options
  const { t } = useTranslation('hooks', { keyPrefix: 'useImportAction' })
  const { doesAccountExist } = useAccountUtils()
  const { handleAct, setError, actionState, actionData, setData, clearErrors, reset } = useActions<TFormData>({
    text: '',
  })

  const validateMnemonic = (value: string) => {
    const isValid = MnemonicHelper.isValidMnemonic(value)

    if (!isValid) throw new Error(t('errors.mnemonicIncomplete'))
  }

  const isValidAddress = (address: string) =>
    Object.values(bsAggregator.blockchainServicesByName).some(service => {
      if (!service.validateAddress(address)) return false
      if (verifyIfAddressAlreadyExists && doesAccountExist({ address, blockchain: service.name })) return false

      return true
    })

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = UtilsHelper.removeSpecialCharacters(event.target.value)
    setData({ text: value, inputType: undefined })

    try {
      const checkFunctionsByInputType: Record<TUseImportActionInputType, (value: string) => boolean> = {
        key: bsAggregator.validateKeyAllBlockchains.bind(bsAggregator),
        mnemonic: MnemonicHelper.isMnemonic,
        encrypted: bsAggregator.validateEncryptedAllBlockchains.bind(bsAggregator),
        address: isValidAddress,
      }

      const functionsByInputType = Object.entries(checkFunctionsByInputType).find(([, checkFunc]) => {
        try {
          return checkFunc(value)
        } catch {
          return false
        }
      })

      if (!functionsByInputType) throw new Error()
      const inputType = functionsByInputType[0] as TUseImportActionInputType

      setData({ inputType })

      const validationByInputType: Partial<Record<TUseImportActionInputType, (value: string) => void>> = {
        mnemonic: validateMnemonic,
      }
      const validateFunc = validationByInputType[inputType]
      validateFunc?.(value)

      clearErrors()
    } catch (error: any) {
      setError('text', error.message || t('errors.invalid'))
    }
  }

  const handleSubmit = async (data: TFormData) => {
    try {
      if (!data.text.length) {
        throw new Error(t('errors.empty'))
      }

      if (!data.inputType) {
        throw new Error(t('errors.invalid'))
      }

      const fixedText = UtilsHelper.removeSpecialCharacters(data.text, { trimText: true })
      const submit = submitByInputType[data.inputType]

      if (!submit) throw new Error(t('errors.invalid'))

      await submit(fixedText, data.inputType)
    } catch (error: any) {
      setError('text', error.message)
    }
  }

  return { actionData, actionState, handleAct, handleChange, handleSubmit, reset }
}
