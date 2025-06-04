import { cloneElement, ComponentProps, useMemo } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useModalRouterOnClose } from '@renderer/hooks/useModalRouterOnClose'

export type TSideModalProps = {
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  contentClassName?: string
  onClose?: () => void
} & ComponentProps<'div'>

export const SideModalLayout = ({
  children,
  heading,
  headingIcon,
  contentClassName,
  onClose,
  className,
  ...props
}: TSideModalProps) => {
  const { modalNavigateWrapper, modalEraseWrapper } = useModalNavigate()
  const { histories } = useModalHistories()

  useModalRouterOnClose(onClose)

  const withBackButton = useMemo(() => {
    return histories.filter(history => history.route.type === 'side').length > 1
  }, [histories])

  return (
    <div
      className={StyleHelper.mergeStyles('flex h-full flex-col bg-gray-800 text-xs text-white', className)}
      {...props}
    >
      <header className="flex flex-col px-4">
        <div className="flex items-center justify-between py-2.5">
          {withBackButton && (
            <IconButton
              icon={<MdKeyboardBackspace aria-hidden={true} className="fill-gray-200" />}
              size="md"
              compacted
              onClick={modalNavigateWrapper(-1)}
            />
          )}

          <div className="flex items-center gap-x-2.5">
            {headingIcon &&
              cloneElement(headingIcon, {
                className: StyleHelper.mergeStyles('w-6 h-6 text-green', headingIcon.props?.className ?? ''),
              })}
            {heading && <h2 className="text-sm">{heading}</h2>}
          </div>

          <IconButton
            icon={<MdClose aria-hidden={true} className="fill-white" />}
            size="md"
            compacted
            onClick={modalEraseWrapper('side')}
          />
        </div>

        <Separator />
      </header>

      <main className={StyleHelper.mergeStyles('min-h-0 min-w-0 flex-grow px-4 py-8', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
