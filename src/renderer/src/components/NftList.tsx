import { TNftResponse } from '@cityofzion/blockchain-service'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'

import TbChevronRight from '@renderer/assets/images/tb-chevron-right.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  nfts: TNftResponse[]
  account: IAccountState
}

export const NftList = ({ account, nfts }: TProps) => {
  const { t: tCommonBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  return (
    <ul className="flex min-w-0 flex-col gap-1">
      {nfts.map(nft => {
        const link = nft.explorerUri

        const content = (
          <Fragment>
            {nft.image && (
              <div className="h-14 max-h-14 min-h-14 w-20 max-w-20 min-w-20 overflow-hidden rounded-sm bg-gray-300/30">
                <img className="pointer-events-none h-full w-full object-cover" src={nft.image} alt={nft.name} />
              </div>
            )}

            <div className="flex min-w-0 grow flex-col justify-between py-1.5">
              <span className="truncate">{nft.name}</span>

              {(nft.collection || nft.creator) && (
                <div className="flex items-center gap-1.5">
                  {nft.collection?.image && (
                    <div className="min-size-4 size-4 overflow-hidden rounded-full bg-gray-300/30">
                      <img
                        className="h-full w-full object-cover"
                        src={nft.collection.image}
                        alt={nft.collection.name}
                      />
                    </div>
                  )}

                  {(!!nft.creator?.name || !!nft.creator?.address) && (
                    <span className="-mt-0.5 truncate text-xs text-gray-300">
                      {nft.creator.name || nft.creator.address}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col items-end justify-between py-1.5">
                <span className="text-blue">{nft.hash}</span>

                <div className="flex items-center gap-1.5">
                  <BlockchainIcon blockchain={account.blockchain} className="size-3 text-gray-100 opacity-60" />
                  <span className="text-xs text-gray-300">{tCommonBlockchain(account.blockchain)}</span>
                </div>
              </div>

              {link && <TbChevronRight aria-hidden className="mx-0 my-auto size-6 text-gray-300" />}
            </div>
          </Fragment>
        )

        return (
          <li key={`${nft.hash}-${nft.collection?.hash}`} className="w-full">
            {link ? (
              <a
                href={link}
                target="_blank"
                className="flex w-full min-w-0 cursor-pointer gap-5 rounded-md bg-gray-700/60 p-2.5 text-sm transition-colors hover:bg-gray-300/30 focus:bg-gray-300/30"
                rel="noreferrer"
              >
                {content}
              </a>
            ) : (
              <div className="flex w-full min-w-0 gap-5 rounded-md bg-gray-700/60 p-2.5 text-sm">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
