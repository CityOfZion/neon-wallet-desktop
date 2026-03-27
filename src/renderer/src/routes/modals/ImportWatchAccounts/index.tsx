import { ChangeEvent, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { AnalyticsHelper } from '@renderer/helpers/AnalyticsHelper'
import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useImportAccounts } from '@renderer/hooks/useAccountActions'
import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdAdd from '@renderer/assets/images/md-add.svg?react'
import TbEyePlus from '@renderer/assets/images/tb-eye-plus.svg?react'

import { AppError } from '@shared/helpers/SharedErrorHelper'
import { TAccountsToImport, TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

import { BlockchainIcon } from '../../../components/BlockchainIcon'

type TValidatedAddress = {
  address: string
  abbreviatedAddress: string
  blockchain: TBlockchainServiceKey
}

const ImportWatchAccountsModal = () => {
  const { modalErase } = useModalNavigate()
  const { createWallet } = useCreateWallet()
  const { importAccounts } = useImportAccounts()
  const { t } = useTranslation('modals', { keyPrefix: 'importWatchAccounts' })
  const { t: tCommonWallet } = useTranslation('common', { keyPrefix: 'wallet' })
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const modalState = useModalState<TModalState<'import-watch-accounts'>>()
  const navigate = useNavigate()

  const { doesAccountExist } = useAccountUtils()
  const [address, setAddress] = useState<string>('')
  const [validatedAddresses, setValidatedAddresses] = useState<TValidatedAddress[]>([])
  const [error, setError] = useState<string>()

  const [isLoading, setIsLoading] = useState(false)

  const modalStateAddress = modalState?.address

  const handleSubmit = async (event: ChangeEvent) => {
    try {
      event.preventDefault()

      setIsLoading(true)

      if (!validatedAddresses.length) {
        throw new AppError(t('errors.invalid'))
      }

      const wallet = createWallet({ name: tCommonWallet('watchAccount') })

      const accountsToImport: TAccountsToImport = validatedAddresses.map(validatedAddress => ({
        address: validatedAddress.address,
        blockchain: validatedAddress.blockchain,
        type: 'watch',
      }))

      const accounts = await importAccounts({ wallet, accounts: accountsToImport })

      AnalyticsHelper.logEvent('wallet_imported')

      modalErase()
      navigate('/wallets/overview', { state: { account: accounts[0] } })
    } catch (error) {
      setError(AppError.wrap(error).displayMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const abbreviateAddress = (address: string): string => {
    if (address.length <= 34) return address

    return StringHelper.truncateStringMiddle(address, 42)
  }

  const handleChangeAndValidateAddress = (address: string) => {
    setAddress(address)

    if (!address.length) {
      setError(t('errors.empty'))
      return
    }

    const validatedAddressesCache: TValidatedAddress[] = []

    for (const blockchainService of Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName)) {
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
    if (!modalStateAddress) return

    handleChangeAndValidateAddress(modalStateAddress)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalStateAddress])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbEyePlus aria-hidden />}
      contentClassName="flex flex-col"
      size="md"
    >
      <p className="text-xs">{t('description')}</p>

      <form className="mt-6 flex min-h-0 grow flex-col" onSubmit={handleSubmit}>
        <Input value={address} onChange={handleChange} placeholder={t('inputPlaceholder')} errorMessage={error} />

        <Banner className="mt-5" message={t('information')} type="info" />

        {validatedAddresses.length > 0 && (
          <div className="flex min-h-0 grow flex-col">
            <Separator className="mt-6" />

            <p className="mt-6 text-xs">{t('willBeAdded')}</p>

            <ul className="mt-5 flex min-h-0 grow flex-col gap-2 overflow-auto">
              {validatedAddresses.map((validatedAddress, index) => (
                <li className="bg-asphalt rounded-md" key={index}>
                  <div className="flex overflow-hidden p-4">
                    <BlockchainIcon
                      blockchain={validatedAddress.blockchain}
                      type="white"
                      className="size-5 opacity-50"
                    />

                    <p className="ml-4 text-xs">{tCommonBlockchain(validatedAddress.blockchain)}</p>
                  </div>
                  <Separator className="mx-4 w-9/10" />
                  <p className="p-4 pt-3 text-xs">{validatedAddress.abbreviatedAddress}</p>
                </li>
              ))}
            </ul>

            <div className="flex w-full justify-center">
              <Button
                className="mt-8 w-full px-5"
                type="submit"
                label={t('buttonAdd')}
                leftIcon={<MdAdd aria-hidden />}
                disabled={validatedAddresses.length === 0}
                loading={isLoading}
                flat
              />
            </div>
          </div>
        )}
      </form>
    </SideModalLayout>
  )
}

export default ImportWatchAccountsModal
