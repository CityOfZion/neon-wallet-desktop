import { ComponentProps, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import FocusLock from 'react-focus-lock'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { motion } from 'framer-motion'

export type TModalContainerProps = {
  children: ReactNode
} & ComponentProps<'div'>

export const ModalContent = ({ children, className }: TModalContainerProps) => (
  <FocusLock>
    <div
      className={StyleHelper.mergeStyles(
        `fixed left-0 top-drag-region h-screen-minus-drag-region w-screen overflow-hidden z-[1000]`,
        className
      )}
    >
      <motion.div
        className="absolute bg-gray-900/50 backdrop-blur-sm top-0 left-0 w-full h-full"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {children}
    </div>
  </FocusLock>
)

export const ModalContainer = (props: TModalContainerProps) => {
  const modalRoot = document.querySelector('#root') as HTMLDivElement
  return createPortal(<ModalContent {...props} />, modalRoot)
}
