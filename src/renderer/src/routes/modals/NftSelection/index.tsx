import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NftResponse } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { SkinCard } from '@renderer/components/SkinCard'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNfts } from '@renderer/hooks/useNfts'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IAccountState } from '@shared/@types/store'

type TState = {
  account: IAccountState
  onSelect: (nft: NftResponse) => void
}

export const NFTSelectionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'nftSelection' })
  const { t: commonT } = useTranslation('common')
  const { account, onSelect } = useModalState<TState>()
  const { modalNavigate } = useModalNavigate()
  const query = useNfts(account)

  const [selectedNft, setSelectedNft] = useState<NftResponse>()

  const handleSave = () => {
    if (!selectedNft) return

    modalNavigate(-1)
    onSelect(selectedNft)
  }

  return (
    <SideModalLayout heading={t('title')} contentClassName="flex flex-col text-gray-100">
      <p className="mb-7">{t('description')}</p>

      <Separator />

      <div className="mt-7 flex flex-col gap-3.5 flex-grow min-h-0">
        <span className="uppercase font-bold">{t('selectTitle')}</span>

        {query.isLoading ? (
          <Loader className="mt-10" />
        ) : query.aggregatedData.length === 0 ? (
          <p className="text-center text-gray-300">{t('emptyList')}</p>
        ) : (
          <ul className="flex flex-col overflow-auto">
            {query.aggregatedData.map((nft, index) => (
              <li key={nft.id}>
                <button
                  className="flex items-center gap-5 hover:opacity-85 w-full transition-opacity"
                  onClick={() => setSelectedNft(nft)}
                  type="button"
                >
                  <SkinCard showCheck={selectedNft?.id === nft.id} image={nft.image} />

                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-blue truncate ">{nft.id}</span>
                    <span className="text-white text-sm capitalize truncate">{nft.name}</span>
                  </div>
                </button>

                {index !== query.aggregatedData.length - 1 && <Separator className="my-2" />}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        label={commonT('general.save')}
        type="button"
        flat
        className="mx-5 mt-5"
        disabled={!selectedNft}
        onClick={handleSave}
      />
    </SideModalLayout>
  )
}
