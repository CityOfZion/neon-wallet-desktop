import { ComponentProps } from 'react'
import { MdArrowBack } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@renderer/components/IconButton'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type Props = { heading: string } & ComponentProps<'div'>

export const LoginKeyLayout = ({ children, heading, className, ...props }: Props) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="w-screen h-screen-minus-drag-region bg-asphalt flex justify-center items-center">
      <div
        className={StyleHelper.mergeStyles(
          'w-full h-full bg-gray-800 max-h-[38.375rem] flex flex-col items-center pb-10 pt-8 px-8 rounded relative max-w-[32rem]',
          className
        )}
        {...props}
      >
        <div className="flex justify-center w-full relative">
          <IconButton icon={<MdArrowBack />} size="md" className="absolute left-0" onClick={handleBack} />
          <h1 className="text-2xl text-white">{heading}</h1>
        </div>

        {children}
      </div>
    </div>
  )
}
