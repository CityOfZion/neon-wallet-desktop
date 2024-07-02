import { useCallback, useState } from 'react'
import { hasNameService } from '@cityofzion/blockchain-service'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { debounce } from 'lodash'

export const useNameService = () => {
  const [isValidatingAddressOrDomainAddress, setIsValidatingAddressOrDomainAddress] = useState(false)
  const [validatedAddress, setValidatedAddress] = useState<string>()
  const [isNameService, setIsNameService] = useState(false)
  const [isValidAddressOrDomainAddress, setIsValidAddressOrDomainAddress] = useState<boolean>()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateAddressOrNSDebounce = useCallback(
    debounce(async (domainOrAddress: string, blockchain: TBlockchainServiceKey) => {
      let isValid = false
      let address: string | undefined
      let isNS = false

      setIsValidatingAddressOrDomainAddress(true)

      try {
        const service = bsAggregator.blockchainServicesByName[blockchain]

        if (service.validateAddress(domainOrAddress)) {
          address = domainOrAddress
          isValid = true
        } else if (hasNameService(service) && service.validateNameServiceDomainFormat(domainOrAddress)) {
          address = await service.resolveNameServiceDomain(domainOrAddress)
          isValid = true
          isNS = true
        }
      } catch {
        isValid = false
        address = undefined
      }

      setIsValidatingAddressOrDomainAddress(false)
      setValidatedAddress(address)
      setIsValidAddressOrDomainAddress(isValid)
      setIsNameService(isNS)
    }, 1000),
    []
  )

  const validateAddressOrNS = useCallback(
    (domainOrAddress?: string, blockchain?: TBlockchainServiceKey) => {
      if (domainOrAddress === undefined || !blockchain) {
        setIsValidatingAddressOrDomainAddress(false)
        setValidatedAddress(undefined)
        setIsNameService(false)
        setIsValidAddressOrDomainAddress(undefined)
        validateAddressOrNSDebounce.cancel()
        return
      }

      validateAddressOrNSDebounce(domainOrAddress, blockchain)
    },
    [validateAddressOrNSDebounce]
  )

  return {
    validateAddressOrNS,
    isValidatingAddressOrDomainAddress,
    validatedAddress,
    isNameService,
    isValidAddressOrDomainAddress,
  }
}
