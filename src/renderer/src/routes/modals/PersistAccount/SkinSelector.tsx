import { SkinCard } from '@renderer/components/SkinCard'
import { ACCOUNT_COLOR_SKINS, ACCOUNT_LOCAL_SKINS } from '@renderer/constants/skins'
import { useUnlockedSkinIdsSelector } from '@renderer/hooks/useUtilitySelector'
import { IAccountState, TSkin } from '@shared/@types/store'

type TProps = {
  label: string
  selectedSkin: TSkin
  onSelectSkin: (skin: TSkin) => void
  account?: IAccountState
}

export const SkinSelector = ({ label, selectedSkin, account, onSelectSkin }: TProps) => {
  const { unlockedSkinIds } = useUnlockedSkinIdsSelector()
  const unlockedLocalSkins =
    account?.type === 'watch' ? [] : ACCOUNT_LOCAL_SKINS.filter(skin => unlockedSkinIds.includes(skin.id))

  return (
    <div>
      <div className="mb-4 mt-4 text-xs font-bold uppercase text-gray-300">{label}</div>
      <div className="grid grid-cols-4 flex-wrap gap-4">
        {ACCOUNT_COLOR_SKINS.map(skin => (
          <button key={skin.id} onClick={() => onSelectSkin({ id: skin.id, type: 'color' })} type="button">
            <SkinCard showCheck={selectedSkin.id === skin.id} color={skin.color} />
          </button>
        ))}

        {/* TODO: create color picker here */}
        {/*<div className="border border-gray-300 text-gray-300 border-dashed w-15 h-15 flex flex-col justify-center items-center">*/}
        {/*  <MdAdd aria-hidden={true} className="text-2xl" />*/}
        {/*</div>*/}

        {unlockedLocalSkins.map(skin => (
          <button key={skin.id} onClick={() => onSelectSkin({ id: skin.id, type: 'local' })} type="button">
            <SkinCard showCheck={selectedSkin.id === skin.id} component={skin.component} />
          </button>
        ))}
      </div>
    </div>
  )
}
