import { ChangeEvent, Fragment, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hasNameService } from '@cityofzion/blockchain-service'
import { TBlockchainServiceKey } from '@renderer/@types/blockchain'
import { TContactAddress } from '@renderer/@types/store'
import { Banner } from '@renderer/components/Banner'
import { BlockchainSelect } from '@renderer/components/BlockchainSelect'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import debounce from 'lodash/debounce'

type TLocationState = {
  contactName: string
  address?: TContactAddress
  handleAddAddress: (address: TContactAddress) => void
}

type TActionData = {
  address: string
  nnsAddress?: string
  isAddressValid?: boolean
  blockchain?: TBlockchainServiceKey
}

export const AddAddressModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'addAddress' })
  const { contactName, address, handleAddAddress } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()
  const [validating, setValidating] = useState(false)

  const { actionData, setData, handleAct } = useActions<TActionData>({
    address: address?.address || '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData({
      address: event.target.value,
    })
    validateAddressOrNSS(event.target.value, actionData.blockchain)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateAddressOrNSS = useCallback(
    debounce(async (address: string, blockchain?: TBlockchainServiceKey) => {
      if (!blockchain || !address) return

      setValidating(true)
      let isValid = false
      let nnsAddress: string | undefined
      try {
        const service = bsAggregator.blockchainServicesByName[blockchain]
        isValid = service.validateAddress(address)
        if (!isValid && hasNameService(service) && service.validateNameServiceDomainFormat(address)) {
          nnsAddress = await service.resolveNameServiceDomain(address)
          isValid = true
        }
      } catch {
        /* empty */
      } finally {
        setValidating(false)
        setData({ nnsAddress, isAddressValid: isValid })
      }
    }, 1000),
    [setData]
  )

  const handleSelectBlockchain = (blockchain: TBlockchainServiceKey) => {
    setData({ blockchain })
  }

  const handleSubmit = (data: TActionData) => {
    if (!data.blockchain || !data.address) return
    const newAddress = { blockchain: data.blockchain, address: data.address }
    handleAddAddress(newAddress)
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={address ? t('editTitle') : t('title')}>
      <form className="flex flex-col gap-y-5 justify-between h-full" onSubmit={handleAct(handleSubmit)}>
        <div className="flex flex-col gap-y-5">
          <div>
            <div className="text-gray-100 font-bold pb-2">{t('name')}</div>
            {StringHelper.truncateStringMiddle(contactName, 35)}
          </div>

          <Separator />

          <div className="text-gray-100 font-bold">{t('blockchain')}</div>
          <BlockchainSelect value={actionData.blockchain} onSelect={handleSelectBlockchain} />

          <div className="text-gray-100 font-bold">{t('addressOrDomain')}</div>
          <Input
            value={actionData.address}
            onChange={handleChange}
            clearable
            compacted
            loading={validating}
            disabled={!actionData.blockchain}
            error={actionData.isAddressValid === false}
          />
          {actionData.nnsAddress && <p className="text-gray-300">{actionData.nnsAddress}</p>}

          {actionData.isAddressValid !== undefined && (
            <Fragment>
              {!actionData.isAddressValid ? (
                <Banner message={t('invalidAddress')} type="error" />
              ) : (
                <Banner message={actionData.nnsAddress ? t('nnsComplete') : t('addressComplete')} type="success" />
              )}
            </Fragment>
          )}
        </div>

        <Button label={t('saveAddress')} className="w-full" type="submit" flat disabled={!actionData.isAddressValid} />
      </form>
    </SideModalLayout>
  )
}
