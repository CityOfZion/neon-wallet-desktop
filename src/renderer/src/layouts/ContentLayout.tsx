import { ComponentProps, ReactNode } from 'react'
import { cloneElement } from 'react'
import { TbArrowLeft } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { DEFAULT_NETWORK_PROFILE } from '@renderer/constants/networks'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

export type TMainLayoutProps = {
  children?: ReactNode
  title: string
  titleIcon?: JSX.Element
  contentClassName?: string
  headerClassName?: string
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
  ...props
}: TMainLayoutProps): JSX.Element => {
  const navigate = useNavigate()
  const { className: titleIconClassName = '', ...titleIconProps } = titleIcon ? titleIcon.props : {}

  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const hasCustomProfile = selectedNetworkProfile.id !== DEFAULT_NETWORK_PROFILE.id

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()

      return
    }

    navigate(-1)
  }

  return (
    <div className={StyleHelper.mergeStyles('flex h-screen-minus-drag-region', className)} {...props}>
      <div
        className={StyleHelper.mergeStyles(
          'h-full w-full flex flex-col bg-asphalt text-white px-14 pb-4 min-w-0 min-h-0',
          {
            'pt-10': hasCustomProfile,
          }
        )}
      >
        <header
          className={StyleHelper.mergeStyles('min-h-16 flex relative items-center justify-between', headerClassName)}
        >
          <IconButton icon={<TbArrowLeft aria-hidden />} size="sm" compacted onClick={handleBackClick} />

          <div
            className={StyleHelper.mergeStyles(
              'flex items-center mx-auto gap-x-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
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

        <Separator />

        <main className={StyleHelper.mergeStyles('flex w-full flex-col flex-grow min-h-0 mt-4', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  )
}
