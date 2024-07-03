import { cloneElement, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCircleCheckFilled } from 'react-icons/tb'
import { LOCAL_WALLET_SKINS } from '@renderer/constants/skins'
import { useUnlockedSkinIdsSelector } from '@renderer/hooks/useSettingsSelector'
import { TSelectedLocalSkin } from '@shared/@types/store'

type Props = {
  selectedSkin?: TSelectedLocalSkin
  onClick: (skin?: TSelectedLocalSkin) => void
}

export const LocalSkinSelector = ({ onClick, selectedSkin }: Props) => {
  const { t } = useTranslation('modals', { keyPrefix: 'editWallet' })
  const { unlockedSkinIds } = useUnlockedSkinIdsSelector()

  const unlockedWalletLocalSkins = useMemo(() => {
    return unlockedSkinIds.map(id => {
      return LOCAL_WALLET_SKINS.find(skin => skin.id === id)!
    })
  }, [unlockedSkinIds])

  return (
    <div>
      <div className="text-gray-300 uppercase text-xs font-bold mb-4">{t('selectSkinLabel')}</div>
      {unlockedWalletLocalSkins.length ? (
        <div className="flex-wrap grid grid-cols-4 gap-4">
          {unlockedWalletLocalSkins.map(skin => (
            <button
              className="w-14 relative"
              key={skin.id}
              onClick={onClick.bind(null, selectedSkin?.id === skin.id ? undefined : { type: 'local', id: skin.id })}
              type="button"
            >
              {cloneElement(skin.component, { className: 'w-full h-full opacity-75' })}

              {selectedSkin?.id === skin.id && (
                <TbCircleCheckFilled className=" w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-gray-300/50 text-xs text-center">{t('noSkinsUnlocked')}</div>
      )}
    </div>
  )
}
