import React from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { ICONS_BY_BLOCKCHAIN } from '@renderer/constants/blockchain'
import { TBlockchainImageColor, TBlockchainServiceKey } from '@shared/@types/blockchain'

type Props = React.SVGProps<SVGSVGElement> & {
  blockchain: TBlockchainServiceKey
  type?: TBlockchainImageColor
}

export const BlockchainIcon = React.memo(({ blockchain, type = 'gray', ...props }: Props) => {
  const Component = ICONS_BY_BLOCKCHAIN[blockchain][type]

  return <Component {...props} className={StyleHelper.mergeStyles('h-4 w-4 object-contain', props.className)} />
})
