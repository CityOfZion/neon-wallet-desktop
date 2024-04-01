import { cloneElement, ComponentProps } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { motion } from 'framer-motion'

import { ModalLayout, TModalProps } from './Modal'

export type TEndModalProps = {
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  contentClassName?: string
  withBackButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
} & ComponentProps<'div'> &
  TModalProps

export const EndModalLayout = ({
  children,
  heading,
  headingIcon,
  contentClassName,
  withBackButton = false,
  closeOnEsc,
  closeOnOutsideClick,
  onClose,
  size = 'sm',
}: TEndModalProps) => {
  const { modalNavigate } = useModalNavigate()

  const handleClose = () => {
    modalNavigate(-1)
    onClose?.()
  }

  return (
    <ModalLayout
      closeOnEsc={closeOnEsc}
      closeOnOutsideClick={closeOnOutsideClick}
      onClose={onClose}
      className="flex justify-end"
    >
      <motion.div
        className="h-full shadow-xl overflow-hidden"
        initial={{ width: 0 }}
        transition={{ duration: 0.1 }}
        animate={{
          width: size === 'sm' ? '20.625rem' : size === 'md' ? '25.875rem' : size === 'lg' ? '45rem' : '62.5rem',
        }}
        exit={{ width: 0 }}
      >
        <div
          className={StyleHelper.mergeStyles('bg-gray-800 h-full text-white text-xs flex flex-col', {
            'w-[25.875rem]': size === 'md',
            'w-[20.625rem]': size === 'sm',
            'w-[62.5rem]': size === 'xl',
            'w-[45rem]': size === 'lg',
          })}
        >
          <header className="flex flex-col px-4">
            <div className="flex justify-between py-2.5  items-center">
              {withBackButton && (
                <IconButton
                  icon={<MdKeyboardBackspace className="fill-gray-200" />}
                  size="md"
                  compacted
                  onClick={handleClose}
                />
              )}

              <div className="flex items-center gap-x-2.5">
                {headingIcon &&
                  cloneElement(headingIcon, {
                    className: StyleHelper.mergeStyles('w-6 h-6 text-blue', headingIcon.props?.className ?? ''),
                  })}
                {heading && <h2 className="text-sm">{heading}</h2>}
              </div>

              <IconButton icon={<MdClose className="fill-white" />} size="md" compacted onClick={handleClose} />
            </div>

            <Separator />
          </header>

          <main className={StyleHelper.mergeStyles('flex-grow py-8 px-4 min-h-0', contentClassName)}>{children}</main>
        </div>
      </motion.div>
    </ModalLayout>
  )
}
