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
        'fixed left-0 top-drag-region z-[1000] h-screen-minus-drag-region w-screen overflow-hidden',
        className
      )}
    >
      <motion.div
        className="absolute left-0 top-0 h-full w-full bg-gray-900/50 backdrop-blur-sm"
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
