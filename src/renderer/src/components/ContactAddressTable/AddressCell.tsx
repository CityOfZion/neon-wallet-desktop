import { useEffect } from 'react'

import { ClipboardHelper } from '@renderer/helpers/ClipboardHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useNameService } from '@renderer/hooks/useNameService'

import MdOutlineContentCopy from '@renderer/assets/images/md-outline-content-copy.svg?react'

import { TContactAddress } from '@shared/types/store'

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
          <Loader containerClassName="justify-start w-min ml-1" className="h-4 w-4" />
        )}

        <IconButton
          icon={<MdOutlineContentCopy className="text-neon" />}
          onClick={() => ClipboardHelper.write(address)}
          {...TestHelper.buildTestObject('copy-address-button')}
        />
      </div>
      {isNameService && <span className="text-gray-300">{validatedAddress}</span>}
    </div>
  )
}
