import { cloneElement } from 'react'
import { MdCheckCircle } from 'react-icons/md'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { match, P } from 'ts-pattern'

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
        'relative h-[3.75rem] w-[3.75rem] min-w-[3.75rem] overflow-hidden rounded bg-gray-300/30 shadow-[4px_2px_4px_0px_rgba(0,0,0,0.3),-9px_-9px_11px_0px_rgba(55,63,71,0.49),inset_1px_1px_0px_0px_rgba(214,210,210,0.14),inset_-1px_-1px_0px_0px_rgba(0,0,0,0.39)] shadow-md',
        className
      )}
    >
      {match({ image, component, color })
        .with({ image: P.when(value => !!value) }, ({ image }) => (
          <img aria-hidden={true} src={image} alt="" className="absolute inset-0 m-auto h-full w-full object-cover" />
        ))
        .with({ component: P.when(value => !!value) }, ({ component }) =>
          cloneElement(component, {
            'aria-hidden': true,
            className: 'w-full h-full object-cover absolute inset-0 m-auto',
          })
        )
        .with({ color: P.when(value => !!value) }, () => (
          <div className={StyleHelper.mergeStyles('h-full w-full', color)} />
        ))
        .otherwise(() => null)}

      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-transparent via-[#4F4F4F15] to-[#5E5E5E20]">
        <MdCheckCircle
          aria-hidden={true}
          className={StyleHelper.mergeStyles('h-6 w-6 text-white opacity-0 transition-opacity', {
            'opacity-100': showCheck,
          })}
        />
      </div>
    </div>
  )
}
