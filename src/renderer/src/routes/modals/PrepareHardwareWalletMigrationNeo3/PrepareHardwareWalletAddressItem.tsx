import { cloneElement, ReactNode } from 'react'

type TProps = {
  title: ReactNode
  label: string
  address: string
  icon: JSX.Element
}

export const PrepareHardwareWalletAddressItem = ({ title, label, address, icon }: TProps) => (
  <div className="flex w-full flex-col gap-y-3 text-sm">
    <h3 className="leading-4 text-white">{title}</h3>

    <div className="flex h-11 items-center gap-x-3 rounded bg-gray-300/15 px-4">
      {cloneElement(icon, {
        ...icon.props,
        className: 'text-blue min-w-5 min-h-5 w-5 h-5',
      })}

      <p className="font-light text-gray-100">{label}</p>
      <p className="flex-grow text-right text-white">{address}</p>
    </div>
  </div>
)
