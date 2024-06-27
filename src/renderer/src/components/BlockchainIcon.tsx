import React from 'react'
import { blockchainIconsByBlockchain } from '@renderer/constants/blockchain'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TBlockchainImageColor, TBlockchainServiceKey } from '@shared/@types/blockchain'

type Props = React.SVGProps<SVGSVGElement> & {
  blockchain: TBlockchainServiceKey
  type?: TBlockchainImageColor
}

export const BlockchainIcon = React.memo(({ blockchain, type = 'gray', ...props }: Props) => {
  const Component = blockchainIconsByBlockchain[blockchain][type]

  return <Component {...props} className={StyleHelper.mergeStyles('w-4 h-4 object-contain', props.className)} />
})
