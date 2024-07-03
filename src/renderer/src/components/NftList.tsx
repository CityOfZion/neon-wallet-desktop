import { useTranslation } from 'react-i18next'
import { TbChevronRight, TbPhotoHeart } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { NftResponse } from '@cityofzion/blockchain-service'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { ExplorerHelper } from '@renderer/helpers/ExplorerHelper'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  nfts: NftResponse[]
  account: IAccountState
}

export const NftList = ({ account, nfts }: TProps) => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'blockchain' })
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const dispatch = useDispatch()

  const handleClick = (nft: NftResponse) => {
    window.open(ExplorerHelper.buildNftUrl(nft.contractHash, nft.id, network.type, account.blockchain), '_blank')
  }

  const handleSelectSkinClick = (nft: NftResponse) => {
    if (!nft.image) return

    dispatch(
      accountReducerActions.saveAccount({
        ...account,
        selectedSkin: { type: 'nft', imgUrl: nft.image, contractHash: nft.contractHash },
      })
    )
  }

  return (
    <ul className="flex flex-col gap-1 min-w-0">
      {nfts.map(nft => (
        <li key={`${nft.contractHash}-${nft.id}`} className="flex w-full gap-2">
          <div
            className="flex p-2.5 gap-5 bg-gray-700/60 rounded-md text-sm items-center cursor-pointer hover:bg-gray-300/30 w-full transition-colors min-w-0"
            onClick={handleClick.bind(null, nft)}
          >
            <div className="min-w-[5rem] w-[5rem] h-[3.5rem] mi-h-[3.5rem] rounded bg-gray-300/30 overflow-hidden">
              <img className="w-full h-full object-cover" src={nft.image} />
            </div>

            <div className="flex flex-col min-w-0 gap-2.5 flex-grow">
              <span className="truncate capitalize">{nft.name}</span>

              <div className="flex gap-1.5 items-center">
                <div className="min-w-[1rem] w-[1rem] min-h-[1rem] h-[1rem] bg-gray-300/30 rounded-full overflow-hidden">
                  <img className="w-full h-full object-cover" src={nft.collectionImage} />
                </div>

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
          </div>

          <button
            className="p-4 h-full w-[4rem] bg-gray-700/60 rounded-md flex items-center justify-center hover:bg-gray-300/30 transition-colors"
            onClick={handleSelectSkinClick.bind(null, nft)}
          >
            <TbPhotoHeart className="w-full h-full text-gray-300" />
          </button>
        </li>
      ))}
    </ul>
  )
}
