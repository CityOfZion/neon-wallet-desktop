import { useMemo } from 'react'
import { MasonryPhotoAlbum } from 'react-photo-album'
import { hasExplorerService, NftResponse } from '@cityofzion/blockchain-service'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

import { BlockchainIcon } from './BlockchainIcon'

import 'react-photo-album/masonry.css'

type TProps = {
  nfts: NftResponse[]
  account: IAccountState
}

export const NftGallery = ({ account, nfts }: TProps) => {
  const photos = useMemo(
    () =>
      nfts.map(nft => ({
        key: `${nft.contractHash}-${nft.id}`,
        title: nft.name,
        src: nft.image ?? '',
        width: 1,
        height: 1,
        nft,
      })),
    [nfts]
  )

  const getExplorerUrl = (nft: NftResponse) => {
    const service = bsAggregator.blockchainServicesByName[account.blockchain]

    if (!hasExplorerService(service)) return

    let explorerUrl: string | undefined

    try {
      explorerUrl = service.explorerService.buildNftUrl({
        contractHash: nft.contractHash,
        tokenId: nft.id,
      })
    } catch (error) {
      console.error(error)
    }

    return explorerUrl
  }

  const handleClick = (explorerUrl: string) => {
    window.open(explorerUrl, '_blank')
  }

  return (
    <MasonryPhotoAlbum
      photos={photos}
      spacing={6}
      columns={5}
      render={{
        track: props => (
          <div
            key={JSON.stringify(props.style)}
            {...props}
            className={StyleHelper.mergeStyles('gap-1.5', props.className)}
          />
        ),
        photo: (_props, { photo }) => {
          const explorerUrl = getExplorerUrl(photo.nft)

          return (
            <div
              key={`${photo.key}-${photo.src}`}
              className={StyleHelper.mergeStyles('p-2.5 bg-gray-300/15 flex flex-col rounded-md gap-2', {
                'cursor-pointer hover:bg-gray-300/30 transition-colors': !!explorerUrl,
              })}
              onClick={explorerUrl ? handleClick.bind(null, explorerUrl) : undefined}
            >
              <div className="rounded overflow-hidden bg-gray-300/30">
                <img
                  loading="lazy"
                  decoding="async"
                  title={photo.title}
                  key={photo.key}
                  src={photo.src}
                  alt={photo.title}
                  className="block w-full h-full"
                />
              </div>

              <div className="flex gap-2.5 items-center">
                <BlockchainIcon blockchain={account.blockchain} type="gray" className="opacity-60 w-3 h-3 ml-0.5" />

                <span className="text-xs capitalize truncate w-20 2xl:w-36">{photo.title}</span>
              </div>

              <div className="flex gap-2 items-center">
                {photo.nft.collectionImage && (
                  <div className="min-w-[1rem] w-[1rem] min-h-[1rem] h-[1rem] bg-gray-300/30 rounded-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={photo.nft.collectionImage}
                      alt={photo.nft.collectionName || photo.nft.creator?.name || photo.nft.name || photo.nft.symbol}
                    />
                  </div>
                )}

                <span className="text-xs capitalize text-blue truncate w-20 2xl:w-32">{photo.nft.id}</span>
              </div>
            </div>
          )
        },
      }}
    />
  )
}
