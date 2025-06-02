type TProps = {
  image: JSX.Element
  title: string
  description: string
}

export const WelcomeCard = ({ image, title, description }: TProps) => {
  return (
    <div className="flex w-full max-w-[10.875rem] flex-col gap-y-4">
      <div className="flex h-[10.875rem] w-[10.875rem] items-center justify-center rounded bg-asphalt drop-shadow-md">
        {image}
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="text-center text-xl text-white">{title}</p>

        <p className="text-center text-xs text-gray-100">{description}</p>
      </div>
    </div>
  )
}
