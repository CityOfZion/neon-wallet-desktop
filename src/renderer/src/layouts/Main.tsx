import { ComponentProps, type JSX, ReactNode, useLayoutEffect } from 'react'

import { motion } from 'motion/react'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAppDispatch } from '@renderer/hooks/useRedux'

import { settingsReducerActions } from '@renderer/store/reducers/settings'

export type TMainLayoutProps = {
  children?: ReactNode
  heading: JSX.Element | string
  rightComponent?: JSX.Element
  contentClassName?: string
  headerClassName?: string
} & ComponentProps<'div'>

export const MainLayout = ({
  heading,
  children,
  contentClassName,
  headerClassName,
  className,
  rightComponent,
  ...props
}: TMainLayoutProps): JSX.Element => {
  const dispatch = useAppDispatch()

  useLayoutEffect(() => {
    dispatch(settingsReducerActions.setShowSideBar(true))
  }, [dispatch])

  return (
    <div className={StyleHelper.mergeStyles('flex h-full grow overflow-hidden', className)} {...props}>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-asphalt flex h-full min-h-0 w-full min-w-0 flex-col px-7 pb-4 text-white"
      >
        <header
          className={StyleHelper.mergeStyles(
            'flex h-16.25 min-h-16.25 items-center justify-between border-b border-b-gray-300/30',
            headerClassName
          )}
        >
          {typeof heading === 'string' ? <h1 className="text-sm font-bold">{heading}</h1> : heading}

          {rightComponent}
        </header>

        <main className={StyleHelper.mergeStyles('flex min-h-0 w-full grow flex-col pt-5', contentClassName)}>
          {children}
        </main>
      </motion.div>
    </div>
  )
}
