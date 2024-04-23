type TProps = {
  image: JSX.Element
  title: string
  description: string
}

export const WelcomeCard = ({ image, title, description }: TProps) => {
  return (
    <div className="w-full max-w-[10.875rem] flex flex-col gap-y-4">
      <div className="flex w-[10.875rem] h-[10.875rem] rounded bg-asphalt justify-center items-center drop-shadow-md">
        {image}
      </div>

      <div className="flex flex-col gap-y-2">
        <p className="text-xl text-white text-center">{title}</p>

        <p className="text-xs text-gray-100 text-center">{description}</p>
      </div>
    </div>
  )
}
