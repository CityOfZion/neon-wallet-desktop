import { ComponentProps, type JSX, ReactNode } from 'react'
import { cloneElement } from 'react'

import { useNavigate } from 'react-router'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import TbArrowLeft from '@renderer/assets/images/tb-arrow-left.svg?react'

import { DEFAULT_NETWORK_PROFILE_ID } from '@renderer/constants/networks'

export type TMainLayoutProps = {
  children?: ReactNode
  title: string
  titleIcon?: JSX.Element
  contentClassName?: string
  headerClassName?: string
  withSeparator?: boolean
  rightComponent?: ReactNode
  onBackClick?: () => void
} & ComponentProps<'div'>

export const ContentLayout = ({
  title,
  titleIcon,
  children,
  contentClassName,
  headerClassName,
  className,
  rightComponent,
  onBackClick,
  withSeparator = true,
  ...props
}: TMainLayoutProps): JSX.Element => {
  const navigate = useNavigate()
  const { className: titleIconClassName = '', ...titleIconProps } = titleIcon ? titleIcon.props : {}

  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const hasCustomProfile = selectedNetworkProfile.id !== DEFAULT_NETWORK_PROFILE_ID

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()

      return
    }

    navigate(-1)
  }

  return (
    <div className={StyleHelper.mergeStyles('flex h-full', className)} {...props}>
      <div
        className={StyleHelper.mergeStyles(
          'bg-asphalt flex h-full min-h-0 w-full min-w-0 flex-col px-14 pb-4 text-white',
          {
            'pt-10': hasCustomProfile,
          }
        )}
      >
        <header
          className={StyleHelper.mergeStyles('relative flex min-h-16 items-center justify-between', headerClassName)}
        >
          <IconButton icon={<TbArrowLeft aria-hidden />} size="sm" compacted onClick={handleBackClick} />

          <div
            className={StyleHelper.mergeStyles(
              'absolute top-1/2 left-1/2 mx-auto flex -translate-x-1/2 -translate-y-1/2 items-center gap-x-2',
              {
                'pr-6': !rightComponent,
              }
            )}
          >
            {titleIcon &&
              cloneElement(titleIcon, {
                className: StyleHelper.mergeStyles('text-neon w-6 h-6', titleIconClassName),
                ...titleIconProps,
              })}

            <h1 className="text-sm">{title}</h1>
          </div>

          {rightComponent}
        </header>

        {withSeparator && <Separator />}

        <main className={StyleHelper.mergeStyles('mt-4 flex min-h-0 w-full grow flex-col', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  )
}
