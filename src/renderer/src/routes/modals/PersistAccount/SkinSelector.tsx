import { SkinCard } from '@renderer/components/SkinCard'

import { SkinHelper } from '@renderer/helpers/SkinHelper'

import { useUnlockedSkinIdsSelector } from '@renderer/hooks/useUtilitySelector'

import { TAccount, TSkin } from '@shared/types/store'

type TProps = {
  label: string
  selectedSkin: TSkin
  onSelectSkin: (skin: TSkin) => void
  account?: TAccount
}

export const SkinSelector = ({ label, selectedSkin, account, onSelectSkin }: TProps) => {
  const { unlockedSkinIds } = useUnlockedSkinIdsSelector()

  return (
    <div>
      <div className="mt-4 mb-4 text-xs font-bold text-gray-300 uppercase">{label}</div>
      <div className="grid grid-cols-4 flex-wrap gap-4">
        {Array.from(SkinHelper.accountColorSkins.values()).map(skin => (
          <button key={skin.id} onClick={() => onSelectSkin({ id: skin.id, type: 'color' })} type="button">
            <SkinCard showCheck={selectedSkin.id === skin.id} color={skin.color} />
          </button>
        ))}

        {account?.type !== 'watch' &&
          unlockedSkinIds.map(skinId => {
            return (
              <button key={skinId} onClick={() => onSelectSkin({ id: skinId, type: 'local' })} type="button">
                <SkinCard
                  showCheck={selectedSkin.id === skinId}
                  component={SkinHelper.localSkins.get(skinId)?.component}
                />
              </button>
            )
          })}
      </div>
    </div>
  )
}
