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

  let url: string

  try {
    const service = bsAggregator.blockchainServicesByName[account.blockchain]
    if (hasExplorerService(service)) {
      url = service.explorerService.buildNftUrl({
        contractHash: nfts[0].contractHash,
        tokenId: nfts[0].id,
      })
    }
  } catch {
    /* empty */
  }

  return (
    <ul className="flex flex-col gap-1 min-w-0">
      {nfts.map(nft => (
        <li key={`${nft.contractHash}-${nft.id}`} className="w-full">
          <a
            href={url}
            target="_blank"
            className="flex p-2.5 gap-5 bg-gray-700/60 rounded-md text-sm items-center cursor-pointer hover:bg-gray-300/30 w-full transition-colors min-w-0"
            rel="noreferrer"
          >
            <div className="min-w-[5rem] w-[5rem] h-[3.5rem] mi-h-[3.5rem] rounded bg-gray-300/30 overflow-hidden">
              <img className="w-full h-full object-cover" src={nft.image} />
            </div>

            <div className="flex flex-col min-w-0 gap-2.5 flex-grow">
              <span className="truncate capitalize">{nft.name}</span>

              <div className="flex gap-1.5 items-center">
                {nft.collectionImage && (
                  <div className="min-w-[1rem] w-[1rem] min-h-[1rem] h-[1rem] bg-gray-300/30 rounded-full overflow-hidden">
                    <img className="w-full h-full object-cover" src={nft.collectionImage} />
                  </div>
                )}

                <span className="text-gray-300 truncate capitalize -mt-0.5 text-xs">
                  {nft.creator.name ?? nft.creator.address}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-end gap-2.5">
                <span className="text-blue">{nft.id}</span>

                <div className="flex items-center gap-1.5">
                  <BlockchainIcon blockchain={account.blockchain} type="gray" className="opacity-60 w-3 h-3" />
                  <span className="text-gray-300 text-xs">{tCommon(account.blockchain)}</span>
                </div>
              </div>

              <TbChevronRight className="w-6 h-6 text-gray-300" />
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
