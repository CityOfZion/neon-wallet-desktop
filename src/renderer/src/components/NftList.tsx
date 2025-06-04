import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { hasExplorerService, NftResponse } from '@cityofzion/blockchain-service'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  nfts: NftResponse[]
  account: IAccountState
}

export const NftList = ({ account, nfts }: TProps) => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'blockchain' })

  const getHref = (nft: NftResponse) => {
    try {
      const service = bsAggregator.blockchainServicesByName[account.blockchain]
      if (hasExplorerService(service)) {
        return service.explorerService.buildNftUrl({
          contractHash: nft.contractHash,
          tokenId: nft.id,
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
          <>
            <div className="mi-h-[3.5rem] h-[3.5rem] w-[5rem] min-w-[5rem] overflow-hidden rounded bg-gray-300/30">
              <img className="h-full w-full object-cover" src={nft.image} alt={nft.name} />
            </div>

            <div className="flex min-w-0 flex-grow flex-col gap-2.5">
              <span className="truncate capitalize">{nft.name}</span>

              <div className="flex items-center gap-1.5">
                {nft.collectionImage && (
                  <div className="h-[1rem] min-h-[1rem] w-[1rem] min-w-[1rem] overflow-hidden rounded-full bg-gray-300/30">
                    <img className="h-full w-full object-cover" src={nft.collectionImage} alt={nft.collectionName} />
                  </div>
                )}

                <span className="-mt-0.5 truncate text-xs capitalize text-gray-300">
                  {nft.creator.name ?? nft.creator.address}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end gap-2.5">
                <span className="text-blue">{nft.id}</span>

                <div className="flex items-center gap-1.5">
                  <BlockchainIcon blockchain={account.blockchain} type="gray" className="h-3 w-3 opacity-60" />
                  <span className="text-xs text-gray-300">{tCommon(account.blockchain)}</span>
                </div>
              </div>

              {link && <TbChevronRight aria-hidden={true} className="h-6 w-6 text-gray-300" />}
            </div>
          </>
        )

        return (
          <li key={`${nft.contractHash}-${nft.id}`} className="w-full">
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
