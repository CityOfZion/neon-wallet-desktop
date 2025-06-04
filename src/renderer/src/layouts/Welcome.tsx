import { ComponentProps } from 'react'
import { MdArrowBack } from 'react-icons/md'
import { useLocation, useNavigate } from 'react-router-dom'
import NeonWalletFull from '@renderer/assets/images/neon-wallet-full.svg?react'
import { IconButton } from '@renderer/components/IconButton'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

type Props = { bigger?: boolean; heading: string; withBackButton?: boolean } & ComponentProps<'div'>

export const WelcomeLayout = ({ bigger, children, heading, withBackButton, className, ...props }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex h-screen-minus-drag-region w-screen items-center justify-center bg-asphalt">
      <div
        className={StyleHelper.mergeStyles(
          'relative flex h-full max-h-[38.375rem] w-full flex-col items-center rounded bg-gray-800 px-16 pb-10 pt-11',
          { 'max-w-[58.125rem]': bigger, 'max-w-[32rem]': !bigger },
          className
        )}
        {...props}
      >
        {withBackButton && location.key !== 'default' && (
          <IconButton
            icon={<MdArrowBack aria-hidden={true} />}
            className="absolute left-5 top-5"
            size="md"
            onClick={handleBack}
          />
        )}
        <NeonWalletFull />
        <h1 className="mt-6 text-2xl text-white">{heading}</h1>
        {children}
      </div>
    </div>
  )
}
