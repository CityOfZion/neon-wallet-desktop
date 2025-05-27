import { cloneElement, ComponentProps, ReactNode, useMemo } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
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
      className={StyleHelper.mergeStyles('bg-gray-800 rounded-md px-4 h-full w-full flex flex-col', className)}
    >
      {headerComponent ?? (
        <header className={StyleHelper.mergeStyles('flex items-center pt-5 pb-2.5', headerClassName)}>
          <div className="flex items-center gap-2.5 flex-grow">
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

          <IconButton
            icon={<MdClose aria-hidden={true} className="text-gray-100" />}
            size="md"
            compacted
            onClick={handleClose}
            {...TestHelper.buildTestObject('center-modal-close-button')}
          />
        </header>
      )}

      {withHeading && <Separator />}

      <main className={StyleHelper.mergeStyles('flex-grow px-9 pb-8 my-2 pt-0.5 min-h-0', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
