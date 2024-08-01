import { useCallback, useState } from 'react'
import { hasNameService } from '@cityofzion/blockchain-service'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { Query, QueryClient, useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'

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
    debounce(async (domainOrAddress: string, blockchain: TBlockchainServiceKey, queryClient: QueryClient) => {
      let isValid = false
      let address: string | undefined
      let isNS = false

      const queryCache = queryClient.getQueryCache()
      const queryKey = buildQueryKey(blockchain, domainOrAddress)
      const defaultedOptions = queryClient.defaultQueryOptions({ queryKey, staleTime: STALE_TIME })
      const query = queryCache.get(defaultedOptions.queryHash) as Query<string> | undefined

      const shouldFetch = !query || query.isStaleByTime(defaultedOptions.staleTime)
      if (shouldFetch) {
        setIsValidatingAddressOrDomainAddress(true)
      } else {
        address = query?.state.data
        isValid = true
        isNS = true
      }

      try {
        const service = bsAggregator.blockchainServicesByName[blockchain]

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

      setIsValidatingAddressOrDomainAddress(false)
      setValidatedAddress(address)
      setIsValidAddressOrDomainAddress(isValid)
      setIsNameService(isNS)
    }, debounceTime),
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

      validateAddressOrNSDebounce(domainOrAddress, blockchain, queryClient)
    },
    [validateAddressOrNSDebounce, queryClient]
  )

  return {
    validateAddressOrNS,
    isValidatingAddressOrDomainAddress,
    validatedAddress,
    isNameService,
    isValidAddressOrDomainAddress,
  }
}
