import { cloneElement } from 'react'
import { MdCheckCircle } from 'react-icons/md'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  showCheck: boolean
  image?: string
  color?: string
  className?: string
  component?: JSX.Element
}

export const SkinCard = ({ showCheck, image, color, className, component }: TProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'w-[3.75rem] min-w-[3.75rem] h-[3.75rem] rounded overflow-hidden bg-gray-300/30 shadow-md relative',
        className
      )}
    >
      {image ? (
        <img className="w-full h-full object-cover" src={image} />
      ) : color ? (
        <div className={StyleHelper.mergeStyles('w-full h-full', color)} />
      ) : component ? (
        cloneElement(component, { className: 'w-full h-full' })
      ) : null}

      <div className="flex items-center justify-center absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#4F4F4F15] to-[#5E5E5E20]">
        <MdCheckCircle
          className={StyleHelper.mergeStyles('text-white w-6 h-6 opacity-0 transition-opacity', {
            'opacity-100': showCheck,
          })}
        />
      </div>
    </div>
  )
}
