import { ComponentProps } from 'react'
import { MdArrowBack } from 'react-icons/md'
import { useLocation, useNavigate } from 'react-router-dom'
import { ReactComponent as NeonWalletFull } from '@renderer/assets/images/neon-wallet-full.svg'
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
    <div className="w-screen h-screen-minus-drag-region bg-asphalt flex justify-center items-center">
      <div
        className={StyleHelper.mergeStyles(
          'w-full h-full bg-gray-800 max-h-[38.375rem] flex flex-col items-center pb-10 pt-11 px-16 rounded relative',
          { 'max-w-[58.125rem]': bigger, 'max-w-[32rem]': !bigger },
          className
        )}
        {...props}
      >
        {withBackButton && location.key !== 'default' && (
          <IconButton icon={<MdArrowBack />} className="absolute top-5 left-5" size="md" onClick={handleBack} />
        )}
        <NeonWalletFull />
        <h1 className="mt-6 text-2xl text-white">{heading}</h1>
        {children}
      </div>
    </div>
  )
}
