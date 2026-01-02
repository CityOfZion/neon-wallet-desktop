import { ChangeEvent } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useAccountUtils } from '@renderer/hooks/useAccountSelector'

import { TUseImportActionInputType } from '@shared/types/hooks'

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
  const { handleAct, setError, actionState, actionData, actionDataRef, actionStateRef, setData, clearErrors, reset } =
    useActions<TFormData>({ text: '' })

  const validateMnemonic = (value: string) => {
    const isValid = BSKeychainHelper.isValidMnemonic(value)

    if (!isValid) throw new Error(t('errors.mnemonicIncomplete'))
  }

  const isValidAddress = (address: string) =>
    Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName).some(service => {
      if (!service.validateAddress(address)) return false
      if (verifyIfAddressAlreadyExists && doesAccountExist({ address, blockchain: service.name })) return false

      return true
    })

  const handleChange = (data: ChangeEvent<HTMLTextAreaElement> | string) => {
    const value = StringHelper.removeSpecialCharacters(typeof data === 'string' ? data : data.target.value)
    setData({ text: value, inputType: undefined })

    try {
      const checkFunctionsByInputType: Record<TUseImportActionInputType, (value: string) => boolean> = {
        key: BlockchainServiceHelper.bsAggregator.validateKeyAllBlockchains.bind(BlockchainServiceHelper.bsAggregator),
        mnemonic: BSKeychainHelper.isMnemonic,
        encrypted: BlockchainServiceHelper.bsAggregator.validateEncryptedAllBlockchains.bind(
          BlockchainServiceHelper.bsAggregator
        ),
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

      const fixedText = StringHelper.removeSpecialCharacters(data.text, { trimText: true })

      const submit = submitByInputType[data.inputType]

      if (!submit) throw new Error(t('errors.invalid'))

      await submit(fixedText, data.inputType)
    } catch (error: any) {
      console.error(error)
      setError('text', error.message)
    }
  }

  return { actionData, actionDataRef, actionState, actionStateRef, handleAct, handleChange, handleSubmit, reset }
}
