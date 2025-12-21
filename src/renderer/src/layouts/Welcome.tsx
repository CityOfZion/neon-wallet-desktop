import { ComponentProps, type ReactNode } from 'react'

import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'

import { IconButton } from '@renderer/components/IconButton'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import MdArrowBack from '@renderer/assets/images/md-arrow-back.svg?react'
import NeonWalletFull from '@renderer/assets/images/neon-wallet-full.svg?react'

type Props = { heading: string; withBackButton?: boolean; children?: ReactNode } & ComponentProps<typeof motion.div>

export const WelcomeLayout = ({ children, heading, withBackButton, className, ...props }: Props) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={StyleHelper.mergeStyles(
        'flex h-full w-full max-w-lg flex-col items-center overflow-y-auto px-16 py-10',
        className
      )}
      {...props}
    >
      {withBackButton && location.key !== 'default' && (
        <IconButton
          icon={<MdArrowBack aria-hidden />}
          className="absolute top-5 left-5"
          size="md"
          onClick={handleBack}
        />
      )}

      <NeonWalletFull className="min-h-14" />

      <h1 className="mt-6 text-2xl text-white">{heading}</h1>

      {children}
    </motion.div>
  )
}
