import { useCallback, useState } from 'react'

import { hasNameService } from '@cityofzion/blockchain-service'
import { Query, useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { TBlockchainServiceKey } from '@shared/types/blockchain'

function buildQueryKey(blockchain: TBlockchainServiceKey, domain: string) {
  return ['nameService', blockchain, domain]
}

const STALE_TIME = 1000 * 60 // 1 minute

export const useNameService = (debounceTime = 1000) => {
  const [isValidatingAddressOrDomainAddress, setIsValidatingAddressOrDomainAddress] = useState(false)
  const [validatedAddress, setValidatedAddress] = useState<string>()
  const [isNameService, setIsNameService] = useState(false)
  const [isValidAddressOrDomainAddress, setIsValidAddressOrDomainAddress] = useState<boolean>()
  const queryClient = useQueryClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateAddressOrNSDebounce = useCallback(
    debounce(async (domainOrAddress: string, blockchain: TBlockchainServiceKey) => {
      let isValid = false
      let address: string | undefined
      let isNS = false

      const queryCache = queryClient.getQueryCache()
      const queryKey = buildQueryKey(blockchain, domainOrAddress)
      const defaultedOptions = queryClient.defaultQueryOptions({ queryKey, staleTime: STALE_TIME })
      const query = queryCache.get(defaultedOptions.queryHash) as Query<string> | undefined
      const shouldFetch = !query || query.isStaleByTime(Number(defaultedOptions.staleTime))

      if (!shouldFetch) {
        address = query?.state.data
        isValid = true
        isNS = true
      }

      try {
        const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

        if (service.validateAddress(domainOrAddress)) {
          address = domainOrAddress
          isValid = true
        } else if (hasNameService(service) && service.validateNameServiceDomainFormat(domainOrAddress) && shouldFetch) {
          address = await service.resolveNameServiceDomain(domainOrAddress)
          isValid = true
          isNS = true

          queryCache.build(queryClient, defaultedOptions).setData(address, { manual: true })
        }
      } catch {
        isValid = false
        address = undefined
      }

      setValidatedAddress(address)
      setIsValidAddressOrDomainAddress(isValid)
      setIsNameService(isNS)
      setIsValidatingAddressOrDomainAddress(false)
    }, debounceTime),
    []
  )

  const validateAddressOrNS = useCallback(
    (domainOrAddress?: string, blockchain?: TBlockchainServiceKey) => {
      setIsValidatingAddressOrDomainAddress(true)

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
