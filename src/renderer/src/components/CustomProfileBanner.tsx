import { createPortal } from 'react-dom'

import { Fragment } from 'react/jsx-runtime'

import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { DEFAULT_NETWORK_PROFILE_ID } from '@renderer/constants/networks'

const Banner = () => {
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  if (selectedNetworkProfile.id === DEFAULT_NETWORK_PROFILE_ID) return <Fragment />

  return (
    <div className="border-purple absolute top-[var(--drag-region-height)] left-0 z-50 flex w-screen justify-center border-t-3">
      <div className="absolute flex justify-center">
        <div className="before:shadow-purple relative h-4.5 w-4.5 overflow-hidden before:absolute before:top-0 before:left-0 before:block before:h-full before:w-full before:rounded-[50%] before:shadow-[0.563rem_-0.563rem_0_0] before:content-['']" />
        <span className="bg-purple block max-w-[400px] truncate rounded-b-md px-2.5 pt-0.5 pb-1 text-xs tracking-wide text-white uppercase">
          {selectedNetworkProfile.name}
        </span>
        <div className="before:shadow-purple relative h-4.5 w-4.5 overflow-hidden before:absolute before:top-0 before:left-0 before:block before:h-full before:w-full before:rounded-[50%] before:shadow-[-0.563rem_-0.563rem_0_0] before:content-['']" />
      </div>
    </div>
  )
}

export const CustomProfileBanner = () => {
  return createPortal(<Banner />, document.getElementById('root')!)
}

export default CustomProfileBanner
