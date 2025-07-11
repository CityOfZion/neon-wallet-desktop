import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import MdAdd from '@renderer/assets/images/md-add.svg?react'
import TbEyePlus from '@renderer/assets/images/tb-eye-plus.svg?react'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TAccountsToImport, TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IWalletState } from '@shared/@types/store'

import { BlockchainIcon } from '../../../components/BlockchainIcon'

type TState = {
  address?: string
  onAddWallet?: (wallet: IWalletState) => void
}

type TValidatedAddress = {
  address: string
  abbreviatedAddress: string
  blockchain: TBlockchainServiceKey
}

export const ImportWatchAccountsModal = () => {
  const { modalNavigate } = useModalNavigate()
  const blockchainActions = useBlockchainActions()
  const { t } = useTranslation('modals', { keyPrefix: 'importWatchAccounts' })
  const { t: commomT } = useTranslation('common', { keyPrefix: 'wallet' })
  const { onAddWallet, address: addressModalState } = useModalState<TState>()
  const navigate = useNavigate()
  const { doesAccountExist } = useAccountUtils()
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

      const wallet = blockchainActions.createWallet({ name: commomT('watchAccount') })

      const accountsToImport: TAccountsToImport = validatedAddresses.map(validatedAddress => ({
        address: validatedAddress.address,
        blockchain: validatedAddress.blockchain,
        type: 'watch',
      }))

      const accounts = await blockchainActions.importAccounts({ wallet, accounts: accountsToImport })

      if (onAddWallet) onAddWallet(wallet)
      else {
        modalNavigate(-2)
        navigate(`/app/wallets/${accounts[0].id}/overview`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const abbreviateAddress = (address: string): string => {
    if (address.length <= 34) return address

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

      if (!isValid || doesAccountExist({ address, blockchain: blockchainService.name })) continue

      validatedAddressesCache.push({
        blockchain: blockchainService.name,
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
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbEyePlus aria-hidden={true} />}
      contentClassName="flex flex-col"
    >
      <p className="text-xs">{t('description')}</p>

      <form className="mt-6 flex min-h-0 flex-grow flex-col" onSubmit={handleSubmit}>
        <Input value={address} onChange={handleChange} placeholder={t('inputPlaceholder')} errorMessage={error} />

        <Banner className="mt-5" message={t('information')} type="info" />

        <div className="flex min-h-0 flex-grow flex-col">
          <Separator className="mt-6" />

          <p className="mt-6 text-xs">{t('willBeAdded')}</p>

          <ul className="mt-5 flex min-h-0 flex-grow flex-col gap-2 overflow-auto">
            {validatedAddresses.map((validatedAddress, index) => (
              <li className="rounded-md bg-asphalt" key={index}>
                <div className="flex overflow-hidden p-4">
                  <BlockchainIcon
                    blockchain={validatedAddress.blockchain}
                    type="white"
                    className="h-5 w-5 opacity-50"
                  />

                  <p className="ml-4 text-xs capitalize">{validatedAddress.blockchain}</p>
                </div>
                <Separator className="w-9/10 mx-4" />
                <p className="p-4 pt-3 text-xs">{validatedAddress.abbreviatedAddress}</p>
              </li>
            ))}
          </ul>

          <div className="flex w-full justify-center">
            <Button
              className="mt-8 w-full px-5"
              type="submit"
              label={t('buttonAdd')}
              leftIcon={<MdAdd aria-hidden={true} />}
              disabled={validatedAddresses.length === 0}
              loading={isLoading}
              flat
            />
          </div>
        </div>
      </form>
    </SideModalLayout>
  )
}
