import { ComponentProps, ReactEventHandler, useState } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { Loader } from './Loader'

type TProps = ComponentProps<'img'> & {
  src: string
  alt: string
  fallbackSrc: string
  imgClassName?: string
}

export const ImageWithFallback = ({ fallbackSrc, className, imgClassName, ...props }: TProps) => {
  const [isLoading, setIsLoading] = useState(true)

  const handleError: ReactEventHandler<HTMLImageElement> = event => {
    event.currentTarget.onerror = null

    if (fallbackSrc) {
      event.currentTarget.src = fallbackSrc
    }
  }

  return (
    <div className={StyleHelper.mergeStyles('flex items-center justify-center', className)}>
      {isLoading && <Loader className="h-4 min-h-4 w-4 min-w-4 text-gray-600" containerClassName="p-2" />}

      <img
        {...props}
        className={StyleHelper.mergeStyles('h-full w-full object-contain', imgClassName, { hidden: isLoading })}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
