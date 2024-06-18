import { createPortal } from 'react-dom'
import { DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

const Banner = () => {
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  if (selectedNetworkProfile.id === DEFAULT_NETWORK_PROFILE.id) return <></>

  return (
    <div className="w-screen border-t-3 border-purple flex justify-center absolute top-drag-region left-0 z-50">
      <div className="w-4.5 h-4.5 overflow-hidden relative before:content-[''] before:block before:w-[100%] before:h-[100%] before:absolute before:top-0 before:left-0 before:shadow-[0.563rem_-0.563rem_0_0] before:shadow-purple before:rounded-[50%]" />
      <span className="text-white text-xs px-2.5 pb-1 pt-0.5 tracking-wide rounded-b-md bg-purple uppercase">
        {selectedNetworkProfile.name}
      </span>
      <div className="w-4.5 h-4.5 overflow-hidden relative before:content-[''] before:block before:w-[100%] before:h-[100%] before:absolute before:top-0 before:left-0 before:shadow-[-0.563rem_-0.563rem_0_0] before:shadow-purple before:rounded-[50%]" />
    </div>
  )
}

export const CustomProfileBanner = () => {
  return createPortal(<Banner />, document.getElementById('root')!)
}
