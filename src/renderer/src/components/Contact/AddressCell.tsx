import { useEffect } from 'react'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TContactAddress } from '@renderer/@types/store'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useNameService } from '@renderer/hooks/useNameService'

import { IconButton } from '../IconButton'

export const AddressCell = ({ address, blockchain }: TContactAddress) => {
  const { validatedAddress, isNameService, validateAddressOrNS } = useNameService()

  useEffect(() => {
    validateAddressOrNS(address, blockchain)
  }, [blockchain, address, validateAddressOrNS])

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-x-1">
        {address}
        <IconButton
          icon={<MdOutlineContentCopy className="text-neon" />}
          size="sm"
          onClick={() => UtilsHelper.copyToClipboard(address)}
        />
      </div>
      {isNameService && <span className="text-gray-300">{validatedAddress}</span>}
    </div>
  )
}
