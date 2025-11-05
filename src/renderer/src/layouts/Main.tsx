import { ComponentProps, type JSX, ReactNode } from 'react'

import { Sidebar } from '@renderer/components/Sidebar'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

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
  return (
    <div className={StyleHelper.mergeStyles('flex h-full', className)} {...props}>
      <Sidebar />

      <div className="bg-asphalt flex h-full min-h-0 w-full min-w-0 flex-col px-7 pb-4 text-white">
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
      </div>
    </div>
  )
}
