import { useMemo } from 'react'

import { TNftResponse } from '@cityofzion/blockchain-service'
import { MasonryPhotoAlbum } from 'react-photo-album'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { IAccountState } from '@shared/types/store'

import { BlockchainIcon } from './BlockchainIcon'

import 'react-photo-album/masonry.css'

type TProps = {
  nfts: TNftResponse[]
  account: IAccountState
}

export const NftGallery = ({ account, nfts }: TProps) => {
  const photos = useMemo(
    () =>
      nfts.map(nft => ({
        key: `${nft.hash}-${nft.collection?.hash}`,
        title: nft.name,
        src: nft.image || '',
        width: 1,
        height: 1,
        nft,
      })),
    [nfts]
  )

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
          const explorerUrl = photo.nft.explorerUri

          return (
            <div
              key={`${photo.key}-${photo.src}`}
              className={StyleHelper.mergeStyles('flex w-full flex-col gap-2 rounded-md bg-gray-300/15 p-2.5', {
                'cursor-pointer transition-colors hover:bg-gray-300/30': !!explorerUrl,
              })}
              onClick={explorerUrl ? handleClick.bind(null, explorerUrl) : undefined}
            >
              {photo.src && (
                <div className="mx-auto w-full overflow-hidden rounded-sm bg-gray-300/30">
                  <img
                    loading="lazy"
                    decoding="async"
                    title={photo.title}
                    key={photo.key}
                    src={photo.src}
                    alt={photo.title}
                    className="pointer-events-none block h-full w-full"
                  />
                </div>
              )}

              <div className="mt-1 flex items-center gap-1.5">
                <BlockchainIcon blockchain={account.blockchain} type="gray" className="mt-0.5 size-3 opacity-60" />

                <span className="w-20 truncate text-xs 2xl:w-36">{photo.title}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {photo.nft.collection?.image && (
                  <div className="min-size-4 mt-0.5 size-4 overflow-hidden rounded-full bg-gray-300/30">
                    <img
                      className="h-full w-full object-cover"
                      src={photo.nft.collection.image}
                      alt={photo.nft.collection.name}
                    />
                  </div>
                )}

                <span className="text-blue w-28 truncate text-xs 2xl:w-32">{photo.nft.hash}</span>
              </div>
            </div>
          )
        },
      }}
    />
  )
}
