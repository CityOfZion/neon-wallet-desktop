import { ComponentProps, ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { motion } from 'motion/react'
import { useHotkeys } from 'react-hotkeys-hook'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'

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
        'fixed top-[var(--drag-region-height)] left-0 z-1000 h-[var(--height-screen-minus-drag-region)] w-full overflow-hidden',
        className
      )}
    >
      <motion.div
        className="absolute top-0 left-0 h-full w-full bg-gray-900/50 backdrop-blur-xs"
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
