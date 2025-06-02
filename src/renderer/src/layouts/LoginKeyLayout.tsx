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
    <div className="flex h-screen-minus-drag-region w-screen items-center justify-center bg-asphalt">
      <div
        className={StyleHelper.mergeStyles(
          'relative flex h-full max-h-[38.375rem] w-full max-w-[32rem] flex-col items-center rounded bg-gray-800 px-8 pb-10 pt-8',
          className
        )}
        {...props}
      >
        <div className="relative flex w-full justify-center">
          <IconButton
            icon={<MdArrowBack aria-hidden={true} />}
            size="md"
            className="absolute left-0"
            onClick={handleBack}
          />
          <h1 className="text-2xl text-white">{heading}</h1>
        </div>

        {children}
      </div>
    </div>
  )
}
