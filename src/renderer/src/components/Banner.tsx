import { cloneElement, ComponentProps, ReactNode } from 'react'
import { MdInfoOutline, MdVerified } from 'react-icons/md'
import { TbAlertHexagonFilled, TbAlertSmall, TbAlertTriangle } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

export type TBannerType = 'info' | 'error' | 'success' | 'warning' | 'warningOrange'

export type TBanner = {
  type: TBannerType
  message: ReactNode
  textClassName?: string
  iconClassName?: string
}

type TProps = TBanner & ComponentProps<'div'>

const iconByType: Record<TBannerType, JSX.Element> = {
  error: <TbAlertHexagonFilled aria-hidden={true} className="h-6 w-6 text-pink" />,
  info: <MdInfoOutline aria-hidden={true} className="h-6 w-6 text-blue" />,
  success: <MdVerified aria-hidden={true} className="h-6 w-6 text-green" />,
  warning: <TbAlertTriangle aria-hidden={true} className="h-6 w-6 text-yellow" />,
  warningOrange: (
    <div className="relative flex h-full items-center justify-center">
      <TbAlertSmall aria-hidden={true} className="h-6 w-6 text-orange" />

      <div className="absolute h-4 w-4 rotate-45 rounded-sm border-2 border-orange" />
    </div>
  ),
}

export const Banner = ({ message, type, className, textClassName, iconClassName, ...props }: TProps) => {
  const icon = iconByType[type]

  return (
    <div className={StyleHelper.mergeStyles('flex items-center rounded bg-gray-300/15', className)} {...props}>
      <div className="flex h-full items-center justify-center rounded-l bg-gray-300/30 px-4 py-3">
        {cloneElement(icon, { className: StyleHelper.mergeStyles(icon.props.className, iconClassName) })}
      </div>

      <p className={StyleHelper.mergeStyles('px-5 py-2 text-xs text-white', textClassName)}>{message}</p>
    </div>
  )
}
