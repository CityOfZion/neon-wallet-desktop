import { hasExplorerService, TNftResponse } from '@cityofzion/blockchain-service'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  nfts: TNftResponse[]
  account: IAccountState
}

export const NftList = ({ account, nfts }: TProps) => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'blockchain' })

  const getHref = (nft: TNftResponse) => {
    try {
      const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]
      if (hasExplorerService(service)) {
        return service.explorerService.buildNftUrl({
          tokenHash: nft.hash,
          collectionHash: nft.collection?.hash,
        })
      }
    } catch {
      /* empty */
    }

    return ''
  }

  return (
    <ul className="flex min-w-0 flex-col gap-1">
      {nfts.map(nft => {
        const link = getHref(nft)
        const content = (
          <Fragment>
            <div className="mi-h-[3.5rem] h-14 w-20 min-w-20 overflow-hidden rounded-sm bg-gray-300/30">
              <img className="h-full w-full object-cover" src={nft.image} alt={nft.name} />
            </div>

            <div className="flex min-w-0 grow flex-col gap-2.5">
              <span className="truncate capitalize">{nft.name}</span>

              <div className="flex items-center gap-1.5">
                {nft.collection?.image && (
                  <div className="h-4 min-h-4 w-4 min-w-4 overflow-hidden rounded-full bg-gray-300/30">
                    <img className="h-full w-full object-cover" src={nft.collection.image} alt={nft.collection.name} />
                  </div>
                )}

                {(nft.creator?.name || nft.creator?.address) && (
                  <span className="-mt-0.5 truncate text-xs text-gray-300 capitalize">
                    {nft.creator?.name ?? nft.creator?.address}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end gap-2.5">
                <span className="text-blue">{nft.hash}</span>

                <div className="flex items-center gap-1.5">
                  <BlockchainIcon blockchain={account.blockchain} type="gray" className="h-3 w-3 opacity-60" />
                  <span className="text-xs text-gray-300">{tCommon(account.blockchain)}</span>
                </div>
              </div>

              {link && <TbChevronRight aria-hidden className="h-6 w-6 text-gray-300" />}
            </div>
          </Fragment>
        )

        return (
          <li key={`${nft.hash}-${nft.collection?.hash}`} className="w-full">
            {link ? (
              <a
                href={link}
                target="_blank"
                className="flex w-full min-w-0 cursor-pointer items-center gap-5 rounded-md bg-gray-700/60 p-2.5 text-sm transition-colors hover:bg-gray-300/30"
                rel="noreferrer"
              >
                {content}
              </a>
            ) : (
              <div className="flex w-full min-w-0 items-center gap-5 rounded-md bg-gray-700/60 p-2.5 text-sm">
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
