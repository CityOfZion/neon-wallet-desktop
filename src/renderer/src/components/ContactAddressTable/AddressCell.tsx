import { useEffect } from 'react'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useNameService } from '@renderer/hooks/useNameService'
import { TContactAddress } from '@shared/@types/store'

import { IconButton } from '../IconButton'
import { Loader } from '../Loader'

export const AddressCell = ({ address, blockchain }: TContactAddress) => {
  const { validatedAddress, isNameService, validateAddressOrNS, isValidatingAddressOrDomainAddress } = useNameService(0)

  useEffect(() => {
    validateAddressOrNS(address, blockchain)
  }, [blockchain, address, validateAddressOrNS])

  return (
    <div className="flex flex-col" {...TestHelper.buildTestObject('address-column-cell')}>
      <div className="flex items-center gap-x-1">
        {address}

        {isValidatingAddressOrDomainAddress && (
          <Loader containerClassName="justify-start w-min ml-1" className="w-4 h-4" />
        )}

        <IconButton
          icon={<MdOutlineContentCopy className="text-neon" />}
          onClick={() => UtilsHelper.copyToClipboard(address)}
          {...TestHelper.buildTestObject('copy-address-button')}
        />
      </div>
      {isNameService && <span className="text-gray-300">{validatedAddress}</span>}
    </div>
  )
}
