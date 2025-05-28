import { ComponentProps, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { motion } from 'framer-motion'

export type TModalContainerProps = {
  children: ReactNode
} & ComponentProps<'div'>

export const ModalContent = ({ children, className }: TModalContainerProps) => {
  const { historiesRef } = useModalHistories()
  const { modalErase } = useModalNavigate()

  const [lastHistory] = historiesRef.current.slice(-1)

  const handleClose = () => {
    modalErase(lastHistory.route.type)
  }

  useHotkeys('esc', handleClose, { enableOnFormTags: true, enabled: !!lastHistory?.route?.closeOnEsc })

  return (
    <div
      className={StyleHelper.mergeStyles(
        'fixed left-0 top-drag-region h-screen-minus-drag-region w-screen overflow-hidden z-[1000]',
        className
      )}
    >
      <motion.div
        className="absolute bg-gray-900/50 backdrop-blur-sm top-0 left-0 w-full h-full"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={lastHistory?.route?.closeOnClickOutside ? handleClose : undefined}
      />

      {children}
    </div>
  )
}

export const ModalContainer = (props: TModalContainerProps) => {
  const modalRoot = document.querySelector('#root') as HTMLDivElement

  return createPortal(<ModalContent {...props} />, modalRoot)
}
