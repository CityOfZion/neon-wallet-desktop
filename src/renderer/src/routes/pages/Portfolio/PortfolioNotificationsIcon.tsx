import { ComponentProps } from 'react'
import { TbBell } from 'react-icons/tb'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useHasNewNotificationsSelector } from '@renderer/hooks/useAuthSelector'

type TProps = ComponentProps<'div'>

export const PortfolioNotificationsIcon = ({ className, ...props }: TProps) => {
  const { hasNewNotifications } = useHasNewNotificationsSelector()
  return (
    <div className={StyleHelper.mergeStyles('relative', className)} {...props}>
      <TbBell className="w-full h-full" aria-hidden />

      {hasNewNotifications && (
        <div className="absolute w-1 h-1 bg-pink rounded-full top-0.5 right-0.5 border-2 border-asphalt box-content" />
      )}
    </div>
  )
}
