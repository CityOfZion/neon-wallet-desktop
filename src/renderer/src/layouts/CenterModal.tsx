import { ComponentProps, ReactNode, useMemo } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
import { IconButton } from '@renderer/components/IconButton'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  contentClassName?: string
  headerComponent?: ReactNode
  onClose?: () => void
  onBack?: () => void
} & ComponentProps<'div'>

export const CenterModalLayout = ({
  children,
  onClose,
  onBack,
  contentClassName,
  className,
  headerComponent,
  ...props
}: TProps) => {
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
    <div
      {...props}
      className={StyleHelper.mergeStyles('bg-gray-800 rounded-md px-4 h-full w-full flex flex-col', className)}
    >
      {headerComponent ?? (
        <header
          className={StyleHelper.mergeStyles('flex items-center pt-5', {
            'justify-between': withBackButton,
            'justify-end': !withBackButton,
          })}
        >
          {withBackButton && (
            <IconButton
              icon={<MdKeyboardBackspace aria-hidden={true} className="fill-gray-200" />}
              size="md"
              compacted
              onClick={handleBack}
            />
          )}

          <IconButton
            icon={<MdClose aria-hidden={true} className="text-gray-100" />}
            size="md"
            compacted
            onClick={handleClose}
            {...TestHelper.buildTestObject('center-modal-close-button')}
          />
        </header>
      )}

      <main className={StyleHelper.mergeStyles('flex-grow px-9 pb-10 pt-2.5 min-h-0', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
