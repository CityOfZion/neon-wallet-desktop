import { createPortal } from 'react-dom'
import { DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

const Banner = () => {
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  if (selectedNetworkProfile.id === DEFAULT_NETWORK_PROFILE.id) return <></>

  return (
    <div className="absolute left-0 top-drag-region z-50 flex w-screen justify-center border-t-3 border-purple">
      <div className="absolute flex justify-center">
        <div className="relative h-4.5 w-4.5 overflow-hidden before:absolute before:left-0 before:top-0 before:block before:h-[100%] before:w-[100%] before:rounded-[50%] before:shadow-[0.563rem_-0.563rem_0_0] before:shadow-purple before:content-['']" />
        <span className="block max-w-[400px] truncate rounded-b-md bg-purple px-2.5 pb-1 pt-0.5 text-xs uppercase tracking-wide text-white">
          {selectedNetworkProfile.name}
        </span>
        <div className="relative h-4.5 w-4.5 overflow-hidden before:absolute before:left-0 before:top-0 before:block before:h-[100%] before:w-[100%] before:rounded-[50%] before:shadow-[-0.563rem_-0.563rem_0_0] before:shadow-purple before:content-['']" />
      </div>
    </div>
  )
}

export const CustomProfileBanner = () => {
  return createPortal(<Banner />, document.getElementById('root')!)
}
