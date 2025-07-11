import { cloneElement, ComponentProps, ReactNode, useMemo } from 'react'
import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdKeyboardBackspace from '@renderer/assets/images/md-keyboard-backspace.svg?react'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useModalRouterOnClose } from '@renderer/hooks/useModalRouterOnClose'

type TProps = {
  contentClassName?: string
  headerClassName?: string
  headerComponent?: ReactNode
  headingIcon?: JSX.Element
  heading?: JSX.Element | string
  onClose?: () => void
  onBack?: () => void
  withCloseButton?: boolean
} & ComponentProps<'div'>

export const CenterModalLayout = ({
  children,
  onClose,
  onBack,
  contentClassName,
  className,
  headerComponent,
  headerClassName,
  heading,
  headingIcon,
  withCloseButton = true,
  ...props
}: TProps) => {
  const { modalNavigate, modalErase } = useModalNavigate()
  const { histories } = useModalHistories()

  useModalRouterOnClose(onClose)

  const withBackButton = useMemo(() => {
    return histories.filter(history => history.route.type === 'center').length > 1
  }, [histories])

  const withHeading = headingIcon || heading

  const handleClose = () => {
    modalErase('center')
  }

  const handleBack = () => {
    modalNavigate(-1)
    onBack?.()
  }

  return (
    <div
      {...props}
      className={StyleHelper.mergeStyles('flex h-full w-full flex-col rounded-md bg-gray-800 px-4', className)}
    >
      {headerComponent ?? (
        <header className={StyleHelper.mergeStyles('flex items-center pb-2.5 pt-5', headerClassName)}>
          <div className="flex flex-grow items-center gap-2.5">
            {withBackButton && (
              <IconButton
                icon={<MdKeyboardBackspace aria-hidden={true} className="fill-gray-200" />}
                size="md"
                compacted
                onClick={handleBack}
              />
            )}

            {withHeading && (
              <div className="flex items-center gap-x-2.5">
                {headingIcon &&
                  cloneElement(headingIcon, {
                    className: StyleHelper.mergeStyles('w-6 h-6 text-green', headingIcon.props?.className ?? ''),
                  })}

                {heading && <h2 className="text-sm text-white">{heading}</h2>}
              </div>
            )}
          </div>

          {withCloseButton && (
            <IconButton
              icon={<MdClose aria-hidden={true} className="text-gray-100" />}
              size="md"
              compacted
              onClick={handleClose}
              {...TestHelper.buildTestObject('center-modal-close-button')}
            />
          )}
        </header>
      )}

      {withHeading && <Separator />}

      <main className={StyleHelper.mergeStyles('my-2 min-h-0 flex-grow px-9 pb-8 pt-0.5', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
