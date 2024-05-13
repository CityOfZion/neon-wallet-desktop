import { cloneElement, ComponentProps, useMemo } from 'react'
import { MdClose, MdKeyboardBackspace } from 'react-icons/md'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalHistories, useModalNavigate } from '@renderer/hooks/useModalRouter'

export type TSideModalProps = {
  heading?: JSX.Element | string
  headingIcon?: JSX.Element
  contentClassName?: string
} & ComponentProps<'div'>

export const SideModalLayout = ({ children, heading, headingIcon, contentClassName }: TSideModalProps) => {
  const { modalNavigateWrapper, modalEraseWrapper } = useModalNavigate()
  const { histories } = useModalHistories()

  const withBackButton = useMemo(() => {
    return histories.filter(history => history.route.type === 'side').length > 1
  }, [histories])

  return (
    <div className="bg-gray-800 h-full text-white text-xs flex flex-col">
      <header className="flex flex-col px-4">
        <div className="flex justify-between py-2.5  items-center">
          {withBackButton && (
            <IconButton
              icon={<MdKeyboardBackspace className="fill-gray-200" />}
              size="md"
              compacted
              onClick={modalNavigateWrapper(-1)}
            />
          )}

          <div className="flex items-center gap-x-2.5">
            {headingIcon &&
              cloneElement(headingIcon, {
                className: StyleHelper.mergeStyles('w-6 h-6 text-neon', headingIcon.props?.className ?? ''),
              })}
            {heading && <h2 className="text-sm">{heading}</h2>}
          </div>

          <IconButton
            icon={<MdClose className="fill-white" />}
            size="md"
            compacted
            onClick={modalEraseWrapper('side')}
          />
        </div>

        <Separator />
      </header>

      <main className={StyleHelper.mergeStyles('flex-grow py-8 px-4 min-h-0 min-w-0', contentClassName)}>
        {children}
      </main>
    </div>
  )
}
