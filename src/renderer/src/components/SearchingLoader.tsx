import { cloneElement } from 'react'
import { TbEyeSearch } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

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
        'px-0.5 flex justify-center overflow-hidden items-center py-0.5 rounded-full relative min-h-[52px]',
        "before:content-[''] before:aspect-square before:block before:bg-[conic-gradient(from_0deg_at_50%_50%,#47BEFF_0%,#47BEFF00_100%)] before:w-full before:absolute before:animate-spin",
        className
      )}
    >
      <div
        className={StyleHelper.mergeStyles(
          'flex gap-2.5 items-center text-blue py-3 text-sm rounded-full px-6 bg-gray-800 relative z-[1]',
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
