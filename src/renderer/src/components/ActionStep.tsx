import { cloneElement, type JSX, ReactNode, useLayoutEffect, useRef, useState } from 'react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

type TProps = {
  title: ReactNode
  footer?: ReactNode
  disabled?: boolean
  leftIcon?: JSX.Element
  leftIconContainerClassName?: string
  className?: string
  titleClassName?: string
  containerClassName?: string
  headerClassName?: string
  defaultHeight?: string
  children?: ReactNode
}

export const ActionStep = ({
  title,
  disabled,
  leftIcon,
  className,
  titleClassName,
  containerClassName,
  headerClassName,
  leftIconContainerClassName,
  defaultHeight,
  children,
  footer,
}: TProps) => {
  const [height, setHeight] = useState<string | undefined>(defaultHeight)
  const [titleLeftPosition, setTileLeftPosition] = useState<number>()

  const titleRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (contentRef.current && height === undefined) {
      const contentHeight = contentRef.current.getBoundingClientRect().height

      setHeight(contentHeight ? `${contentHeight}px` : 'auto')
    }

    if (titleRef.current) {
      const titleLeft = titleRef.current.getBoundingClientRect().left
      const parentLeft = titleRef.current.parentElement?.getBoundingClientRect().left || 0
      const leftPosition = titleLeft - parentLeft

      setTileLeftPosition(leftPosition)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={StyleHelper.mergeStyles('flex w-full flex-col gap-2.5 py-3', className)}>
      <div className={StyleHelper.mergeStyles('flex w-full justify-between gap-6', containerClassName)}>
        <div
          className={StyleHelper.mergeStyles(
            'flex h-min min-w-0 items-center gap-2.5',
            {
              'opacity-50': disabled,
            },
            headerClassName
          )}
          style={{ height: height || 'auto' }}
        >
          {leftIcon && (
            <div
              className={StyleHelper.mergeStyles(
                'flex h-6 min-h-6 w-6 min-w-6 items-center justify-center',
                leftIconContainerClassName
              )}
            >
              {cloneElement(leftIcon, {
                ...leftIcon.props,
                className: StyleHelper.mergeStyles('text-blue w-full h-full', leftIcon.props.className),
              })}
            </div>
          )}

          {typeof title === 'string' ? (
            <span
              ref={titleRef}
              className={StyleHelper.mergeStyles('text-sm whitespace-nowrap text-white', titleClassName)}
            >
              {title}
            </span>
          ) : (
            title
          )}
        </div>

        <div className="flex items-center" ref={contentRef}>
          {children}
        </div>
      </div>

      {footer && (
        <div
          style={{
            marginLeft: titleLeftPosition,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
