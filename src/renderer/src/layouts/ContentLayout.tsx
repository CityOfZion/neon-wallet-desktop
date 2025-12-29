import { ComponentProps, type JSX, ReactNode, useLayoutEffect } from 'react'
import { cloneElement } from 'react'

import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import TbArrowLeft from '@renderer/assets/images/tb-arrow-left.svg?react'

import { DEFAULT_NETWORK_PROFILE_ID } from '@renderer/constants/networks'
import { settingsReducerActions } from '@renderer/store/reducers/settings'

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
  const dispatch = useAppDispatch()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()

  const { className: titleIconClassName = '', ...titleIconProps } = titleIcon ? titleIcon.props : {}

  const hasCustomProfile = selectedNetworkProfile.id !== DEFAULT_NETWORK_PROFILE_ID

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()

      return
    }

    navigate(-1)
  }

  useLayoutEffect(() => {
    dispatch(settingsReducerActions.setShowSideBar(false))
  }, [dispatch])

  return (
    <div className={StyleHelper.mergeStyles('flex h-full grow overflow-x-hidden', className)} {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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
      </motion.div>
    </div>
  )
}
