import { cloneElement, JSX, ReactNode } from 'react'

type TProps = {
  title: ReactNode
  text: string
  address: string
  icon: JSX.Element
}

export const PrepareHardwareWalletAddressItem = ({ title, text, address, icon }: TProps) => (
  <div className="flex flex-col gap-y-3 text-sm w-full">
    <h3 className="text-white leading-4">{title}</h3>

    <div className="flex items-center gap-x-3 px-4 h-11 bg-gray-300/15 rounded">
      {cloneElement(icon, {
        ...icon.props,
        'aria-hidden': true,
        className: 'text-blue min-w-5 min-h-5 w-5 h-5',
      })}

      <p className="text-gray-100 font-light">{text}</p>
      <p className="text-white text-right flex-grow">{address}</p>
    </div>
  </div>
)
