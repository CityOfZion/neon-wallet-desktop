import { cloneElement } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCircleCheckFilled } from 'react-icons/tb'
import { WALLET_SKINS } from '@renderer/constants/skins'

type Props = {
  selectedSkinId?: string
  onClick: (skinId?: string) => void
}

export const SkinSelector = ({ onClick, selectedSkinId }: Props) => {
  const { t } = useTranslation('modals', { keyPrefix: 'editWallet' })

  return (
    <div>
      <div className="text-gray-300 uppercase text-xs font-bold mb-4">{t('selectSkinLabel')}</div>
      <div className="flex-wrap grid grid-cols-4 gap-4">
        {WALLET_SKINS.map(skin => (
          <button
            className="w-14 relative"
            key={skin.id}
            onClick={onClick.bind(null, selectedSkinId === skin.id ? undefined : skin.id)}
            type="button"
          >
            {cloneElement(skin.component, { className: 'w-full h-full opacity-75' })}

            {selectedSkinId === skin.id && (
              <TbCircleCheckFilled className=" w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
