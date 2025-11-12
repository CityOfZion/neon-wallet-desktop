import { ChangeEvent, Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { BlockchainSelect } from '@renderer/components/BlockchainSelect'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNameService } from '@renderer/hooks/useNameService'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

type TActionData = {
  address: string
  blockchain?: TBlockchainServiceKey
}

const AddAddressModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'addAddress' })
  const { contactName, address, index, handleAddAddress } = useModalState<TModalState<'add-address'>>()
  const { modalNavigate } = useModalNavigate()

  const {
    isNameService,
    isValidAddressOrDomainAddress,
    isValidatingAddressOrDomainAddress,
    validateAddressOrNS,
    validatedAddress,
  } = useNameService()

  const { actionData, setData, handleAct } = useActions<TActionData>({
    address: address?.address || '',
    blockchain: address?.blockchain,
  })

  const handleChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const fixedValue = UtilsHelper.removeSpecialCharacters(value, { allowSpaces: false, allowDots: true })
    setData({ address: fixedValue })
    validateAddressOrNS(fixedValue, actionData.blockchain)
  }

  const handleSelectBlockchain = (blockchain: TBlockchainServiceKey) => {
    setData({ blockchain })

    const { address } = actionData

    if (address) validateAddressOrNS(address, blockchain)
  }

  const handleSubmit = async ({ blockchain, address }: TActionData) => {
    if (!blockchain || !address) return

    await handleAddAddress({ blockchain, address }, index)

    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={address ? t('editTitle') : t('title')}>
      <form className="flex h-full flex-col justify-between gap-y-5" onSubmit={handleAct(handleSubmit)}>
        <div className="flex flex-col gap-y-5">
          <div>
            <div className="pb-2 font-bold text-gray-100">{t('name')}</div>
            {StringHelper.truncateStringMiddle(contactName, 35)}
          </div>

          <Separator />

          <p aria-labelledby="blockchainSelect" className="font-bold text-gray-100 uppercase">
            {t('blockchain')}
          </p>

          <BlockchainSelect
            value={actionData.blockchain}
            onSelect={handleSelectBlockchain}
            testId="contact-blockchain-select"
          />

          <p aria-labelledby="addressOrDomain" className="font-bold text-gray-100 uppercase">
            {t('addressOrDomain')}
          </p>

          <Input
            id="addressOrDomain"
            testId="contact-address-or-domain-input"
            value={actionData.address}
            onChange={handleChange}
            clearable
            compacted
            pastable
            loading={isValidatingAddressOrDomainAddress}
            disabled={!actionData.blockchain}
            error={isValidAddressOrDomainAddress === false}
          />
          {isNameService && <p className="text-gray-300">{validatedAddress}</p>}

          {isValidAddressOrDomainAddress !== undefined && (
            <Fragment>
              {!isValidAddressOrDomainAddress ? (
                <Banner
                  message={t('invalidAddress')}
                  type="error"
                  {...TestHelper.buildTestObject('address-or-domain-error-message')}
                />
              ) : (
                <Banner
                  message={isNameService ? t('nnsComplete') : t('addressComplete')}
                  type="success"
                  {...TestHelper.buildTestObject('address-or-domain-success-message')}
                />
              )}
            </Fragment>
          )}
        </div>

        <Button
          label={t('saveAddress')}
          className="w-full"
          type="submit"
          flat
          disabled={!isValidAddressOrDomainAddress || isValidatingAddressOrDomainAddress}
          {...TestHelper.buildTestObject('save-contact-address-button')}
        />
      </form>
    </SideModalLayout>
  )
}

export default AddAddressModal
