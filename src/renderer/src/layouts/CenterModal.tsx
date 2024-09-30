import { ComponentProps, useMemo } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
import { IconButton } from '@renderer/components/IconButton'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  contentClassName?: string
  onClose?: () => void
  onBack?: () => void
} & ComponentProps<'div'>

export const CenterModalLayout = ({ children, onClose, onBack, contentClassName }: TProps) => {
  const { modalNavigate, modalErase } = useModalNavigate()
  const { histories } = useModalHistories()

  const withBackButton = useMemo(() => {
    return histories.filter(history => history.route.type === 'center').length > 1
  }, [histories])

  const handleClose = () => {
    modalErase('center')
    onClose?.()
  }

  const handleBack = () => {
    modalNavigate(-1)
    onBack?.()
  }

  return (
    <div className="bg-gray-800 rounded-md px-4 h-full w-full flex flex-col">
      <header
        className={StyleHelper.mergeStyles('flex items-center pt-5', {
          'justify-between': withBackButton,
          'justify-end': !withBackButton,
        })}
      >
        {withBackButton && (
          <IconButton
            icon={<MdKeyboardBackspace className="fill-gray-200" />}
            size="md"
            compacted
            onClick={handleBack}
          />
        )}

        <IconButton
          testId="center-modal-close"
          icon={<MdClose className="fill-white" />}
          size="md"
          compacted
          onClick={handleClose}
        />
      </header>

      <main className={StyleHelper.mergeStyles('flex-grow px-9 pb-10 pt-2.5 min-h-0', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
