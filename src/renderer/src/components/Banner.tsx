import { cloneElement, ComponentProps, type JSX, ReactNode } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'
import MdVerified from '@renderer/assets/images/md-verified.svg?react'
import PiWarningDiamondFill from '@renderer/assets/images/pi-warning-diamond-fill.svg?react'
import TbAlertSmall from '@renderer/assets/images/tb-alert-small.svg?react'
import TbAlertTriangle from '@renderer/assets/images/tb-alert-triangle.svg?react'
import TbAlertHexagonFilled from '@renderer/assets/images/tb-filled-alert-hexagon.svg?react'

type TType = 'info' | 'error' | 'success' | 'warning' | 'warningOrange' | 'alert'

type TProps = ComponentProps<'div'> & {
  type: TType
  message: ReactNode
  textClassName?: string
  iconClassName?: string
}

const iconByType: Record<TType, JSX.Element> = {
  error: <TbAlertHexagonFilled aria-hidden className="text-pink size-6" />,
  info: <MdInfoOutline aria-hidden className="text-blue size-6" />,
  success: <MdVerified aria-hidden className="text-green size-6" />,
  warning: <TbAlertTriangle aria-hidden className="text-yellow size-6" />,
  warningOrange: (
    <div className="relative flex h-full items-center justify-center">
      <TbAlertSmall aria-hidden className="text-orange size-6" />

      <div className="border-orange absolute size-4 rotate-45 rounded-xs border-2" />
    </div>
  ),
  alert: <PiWarningDiamondFill aria-hidden className="text-pink size-6" />,
}

export const Banner = ({ message, type, className, textClassName, iconClassName, ...props }: TProps) => {
  const icon = iconByType[type]

  return (
    <div className={StyleHelper.mergeStyles('flex items-center rounded-sm bg-gray-300/15', className)} {...props}>
      <div className="flex h-full items-center justify-center rounded-l bg-gray-300/30 px-4 py-3">
        {cloneElement(icon, { className: StyleHelper.mergeStyles(icon.props.className, iconClassName) })}
      </div>

      <p className={StyleHelper.mergeStyles('px-5 py-2 text-xs text-white', textClassName)}>{message}</p>
    </div>
  )
}
