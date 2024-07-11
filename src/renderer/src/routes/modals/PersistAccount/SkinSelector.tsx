import { MdAdd } from 'react-icons/md'
import { SkinCard } from '@renderer/components/SkinCard'
import { ACCOUNT_COLOR_SKINS, ACCOUNT_LOCAL_SKINS } from '@renderer/constants/skins'
import { useUnlockedSkinIdsSelector } from '@renderer/hooks/useSettingsSelector'
import { TNftSkin, TSkin } from '@shared/@types/store'

type TProps = {
  label: string
  selectedSkin: TSkin
  lastNftSkin?: TNftSkin
  onSelectSkin: (skin: TSkin) => void
}

export const SkinSelector = ({ label, selectedSkin, onSelectSkin, lastNftSkin }: TProps) => {
  const { unlockedSkinIds } = useUnlockedSkinIdsSelector()

  const unlokedLocalSkins = ACCOUNT_LOCAL_SKINS.filter(skin => unlockedSkinIds.includes(skin.id))

  return (
    <div>
      <div className="text-gray-300 uppercase text-xs font-bold mt-4 mb-4">{label}</div>
      <div className="flex-wrap grid grid-cols-4 gap-4">
        {ACCOUNT_COLOR_SKINS.map(skin => (
          <button key={skin.id} onClick={() => onSelectSkin({ id: skin.id, type: 'color' })} type="button">
            <SkinCard
              showCheck={selectedSkin.id === skin.id}
              color={skin.color}
              className="shadow-[4px_2px_4px_0px_rgba(0,0,0,0.3),-9px_-9px_11px_0px_rgba(55,63,71,0.49),inset_1px_1px_0px_0px_rgba(214,210,210,0.14),inset_-1px_-1px_0px_0px_rgba(0,0,0,0.39)]"
            />
          </button>
        ))}

        <div className="border border-gray-300 text-gray-300 border-dashed w-15 h-15 flex flex-col justify-center items-center">
          <MdAdd className="text-2xl" />
        </div>

        {lastNftSkin && (
          <button type="button" onClick={() => onSelectSkin(lastNftSkin)}>
            <SkinCard showCheck={selectedSkin.id === lastNftSkin.id} image={lastNftSkin.imgUrl} />
          </button>
        )}

        {unlokedLocalSkins.map(skin => (
          <button key={skin.id} onClick={() => onSelectSkin({ id: skin.id, type: 'local' })} type="button">
            <SkinCard showCheck={selectedSkin.id === skin.id} component={skin.component} />
          </button>
        ))}
      </div>
    </div>
  )
}
