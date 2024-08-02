import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdAdd } from 'react-icons/md'
import { TbEyePlus } from 'react-icons/tb'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TAccountsToImport, TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IWalletState } from '@shared/@types/store'

import { BlockchainIcon } from '../../../components/BlockchainIcon'

type TAddWatchState = {
  address?: string
  onAddWallet?: (wallet: IWalletState) => void
}

type TValidatedAddress = {
  address: string
  abbreviatedAddress: string
  blockchain: TBlockchainServiceKey
}

export const AddWatch = () => {
  const { modalNavigate } = useModalNavigate()
  const blockchainActions = useBlockchainActions()
  const { t } = useTranslation('modals', { keyPrefix: 'addWatch' })
  const { t: commomT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { onAddWallet, address: addressModalState } = useModalState<TAddWatchState>()

  const [address, setAddress] = useState<string>('')
  const [validatedAddresses, setValidatedAddresses] = useState<TValidatedAddress[]>([])
  const [error, setError] = useState<string>()

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    try {
      event.preventDefault()
      setIsLoading(true)

      if (!validatedAddresses.length) {
        throw new Error(t('errors.invalid'))
      }

      const wallet = blockchainActions.createWallet({
        name: commomT('watchAccount'),
      })

      const accountsToImport: TAccountsToImport = validatedAddresses.map(validatedAddress => ({
        address: validatedAddress.address,
        blockchain: validatedAddress.blockchain,
        type: 'watch',
      }))

      blockchainActions.importAccounts({ wallet, accounts: accountsToImport })

      onAddWallet?.(wallet)

      modalNavigate(-2)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const abbreviateAddress = (address: string): string => {
    if (address.length <= 34) {
      return address
    }
    return (
      address.substring(0, address.length / 2 - 4) + '.....' + address.substring(address.length / 2 + 4, address.length)
    )
  }

  const handleChangeAndValidateAddress = (address: string) => {
    setAddress(address)

    if (!address.length) {
      setError(t('errors.empty'))
      return
    }

    const validatedAddressesCache: TValidatedAddress[] = []

    for (const blockchainService of Object.values(bsAggregator.blockchainServicesByName)) {
      const isValid = blockchainService.validateAddress(address)
      if (!isValid) continue

      validatedAddressesCache.push({
        blockchain: blockchainService.blockchainName,
        abbreviatedAddress: abbreviateAddress(address),
        address,
      })
    }

    setValidatedAddresses(validatedAddressesCache)
    setError(validatedAddressesCache.length ? undefined : t('errors.invalid'))
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    handleChangeAndValidateAddress(value)
  }

  useEffect(() => {
    if (addressModalState) handleChangeAndValidateAddress(addressModalState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressModalState])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbEyePlus />} contentClassName="flex flex-col">
      <p className="text-xs">{t('description')}</p>

      <form className="mt-6 flex flex-col flex-grow min-h-0" onSubmit={handleSubmit}>
        <Input value={address} onChange={handleChange} placeholder={t('inputPlaceholder')} errorMessage={error} />

        <Banner className="mt-5" message={t('information')} type="info" />

        <div className="flex flex-col flex-grow min-h-0">
          <Separator className="mt-6" />

          <p className="mt-6 text-xs">{t('willBeAdded')}</p>

          <ul className="flex flex-col flex-grow gap-2 mt-5 overflow-auto min-h-0">
            {validatedAddresses.map((validatedAddress, index) => (
              <li className="bg-asphalt rounded-md" key={index}>
                <div className="flex p-4 overflow-hidden">
                  <BlockchainIcon
                    blockchain={validatedAddress.blockchain}
                    type="white"
                    className="w-5 h-5 opacity-50"
                  />

                  <p className="text-xs ml-4 capitalize">{validatedAddress.blockchain}</p>
                </div>
                <Separator className="mx-4 w-9/10" />
                <p className="text-xs p-4 pt-3">{validatedAddress.abbreviatedAddress}</p>
              </li>
            ))}
          </ul>

          <div className="flex justify-center w-full">
            <Button
              className="mt-8 w-full px-5"
              type="submit"
              label={t('buttonAdd')}
              leftIcon={<MdAdd />}
              loading={isLoading}
              flat
            />
          </div>
        </div>
      </form>
    </SideModalLayout>
  )
}
