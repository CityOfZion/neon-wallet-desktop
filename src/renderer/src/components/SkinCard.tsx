import { cloneElement, type JSX } from 'react'

import { match, P } from 'ts-pattern'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdCheckCircle from '@renderer/assets/images/md-check-circle.svg?react'

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
        'relative h-15 w-15 min-w-15 overflow-hidden rounded-sm bg-gray-300/30 shadow-[4px_2px_4px_0px_rgba(0,0,0,0.3),-9px_-9px_11px_0px_rgba(55,63,71,0.49),inset_1px_1px_0px_0px_rgba(214,210,210,0.14),inset_-1px_-1px_0px_0px_rgba(0,0,0,0.39)]',
        className
      )}
    >
      {match({ image, component, color })
        .with({ image: P.when(value => !!value) }, ({ image }) => (
          <img
            aria-hidden
            src={image}
            alt=""
            className="pointer-events-none absolute inset-0 m-auto size-full object-cover"
          />
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

      <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center bg-linear-to-b from-transparent via-[#4F4F4F15] to-[#5E5E5E20]">
        <MdCheckCircle
          aria-hidden
          className={StyleHelper.mergeStyles('size-6 text-white opacity-0 transition-opacity', {
            'opacity-100': showCheck,
          })}
        />
      </div>
    </div>
  )
}
