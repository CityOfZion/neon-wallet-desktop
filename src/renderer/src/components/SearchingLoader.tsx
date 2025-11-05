import { cloneElement, type JSX } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import TbEyeSearch from '@renderer/assets/images/tb-eye-search.svg?react'

type TProps = {
  label: string
  className?: string
  contentClassName?: string
  icon?: JSX.Element
}

export const SearchingLoader = ({ label, className, contentClassName, icon }: TProps) => {
  if (!icon) icon = <TbEyeSearch />

  return (
    <div
      className={StyleHelper.mergeStyles(
        'relative flex min-h-[52px] items-center justify-center overflow-hidden rounded-full px-0.5 py-0.5',
        "before:absolute before:block before:aspect-square before:w-full before:animate-spin before:bg-[conic-gradient(from_0deg_at_50%_50%,#47BEFF_0%,#47BEFF00_100%)] before:content-['']",
        className
      )}
    >
      <div
        className={StyleHelper.mergeStyles(
          'text-blue relative z-1 flex items-center gap-2.5 rounded-full bg-gray-800 px-6 py-3 text-sm',
          contentClassName
        )}
      >
        <span>{label}</span>

        {cloneElement(icon, {
          ...icon.props,
          'aria-hidden': true,
          className: 'w-6 h-6',
        })}
      </div>
    </div>
  )
}
