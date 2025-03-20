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
        "before:content-[''] before:block before:bg-gradient-to-tr before:animate-spin before:from-blue before:to-60% before:w-[200%] before:h-[400%] before:absolute",
        className
      )}
    >
      <div
        className={StyleHelper.mergeStyles(
          'flex gap-5 items-center text-blue py-3 rounded-full px-10 bg-gray-800 relative z-[1]',
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
