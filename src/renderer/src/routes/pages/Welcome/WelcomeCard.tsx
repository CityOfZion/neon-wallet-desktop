import type { JSX } from 'react'

type TProps = {
  image: JSX.Element
  title: string
  description: string
}

export const WelcomeCard = ({ image, title, description }: TProps) => {
  return (
    <div className="flex w-full max-w-43.5 flex-col gap-y-4">
      <div className="bg-asphalt flex h-43.5 w-43.5 items-center justify-center rounded-sm drop-shadow-md">{image}</div>

      <div className="flex flex-col gap-y-2">
        <p className="text-center text-xl text-white">{title}</p>

        <p className="text-center text-xs text-gray-100">{description}</p>
      </div>
    </div>
  )
}
