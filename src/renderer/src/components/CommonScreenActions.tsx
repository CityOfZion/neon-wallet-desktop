import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { MdMoreVert } from 'react-icons/md'
import { TbBell, TbDeviceUsb, TbFileImport, TbHelp, TbMessage, TbPlus, TbSearch } from 'react-icons/tb'
import { DISCORD_LINK } from '@renderer/constants/urls'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useCurrentLoginSessionSelector, useHasNewNotificationsSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { ActionPopover } from './ActionPopover'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Separator } from './Separator'

type TProps = ComponentProps<'div'>

export const CommonScreenActions = ({ children, className, ...props }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'commonScreenActions' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { hasNewNotifications } = useHasNewNotificationsSelector()
  const { currentLoginSession } = useCurrentLoginSessionSelector()

  const isPasswordLogin = currentLoginSession?.type === 'password'

  return (
    <div className={StyleHelper.mergeStyles('flex h-full', className)} {...props}>
      <div className="flex h-full gap-x-2">
        <Button
          variant="card"
          leftIcon={<TbSearch aria-hidden />}
          label={t('searchButtonLabel')}
          colorSchema="neon"
          onClick={modalNavigateWrapper('search')}
          {...TestHelper.buildTestObject('search-button')}
        />

        <IconButton
          text={t('notificationButtonLabel')}
          size="sm"
          fullHeight
          className="min-w-14"
          icon={
            <div className="relative h-6 w-6">
              <TbBell className="h-6 w-6" aria-hidden />

              {hasNewNotifications && (
                <div
                  aria-label={t('unreadNotificationsIconLabel')}
                  className="absolute right-0.5 top-0.5 box-content h-1 w-1 rounded-full border-2 border-asphalt bg-pink"
                />
              )}
            </div>
          }
          onClick={modalNavigateWrapper('notifications')}
        />

        <ActionPopover.Root>
          <ActionPopover.Trigger asChild>
            <IconButton
              text={t('helpButtonLabel')}
              className="min-w-16 hover:bg-yellow/15 hover:enabled:bg-yellow/15 aria-expanded:bg-yellow/15 aria-expanded:hover:bg-yellow/15 aria-selected:bg-yellow/15 aria-selected:hover:bg-yellow/15"
              colorSchema="yellow"
              size="md"
              fullHeight
              icon={<TbHelp aria-hidden="true" />}
              {...TestHelper.buildTestObject('help-button')}
            />
          </ActionPopover.Trigger>

          <ActionPopover.Content
            side="bottom"
            color="yellow"
            sideOffset={-10}
            contentClassName="bg-gray-900/60 backdrop-blur-sm"
            {...TestHelper.buildTestObject('help-content')}
          >
            <ActionPopover.Item
              actionPopoverItemType="link"
              label={t('chatWithUsButtonLabel')}
              to={DISCORD_LINK}
              target="_blank"
              colorSchema="white"
              iconsOnEdge={false}
              leftIcon={<TbMessage aria-hidden="true" className="text-yellow" />}
              {...TestHelper.buildTestObject('help-chat-with-us')}
            />
          </ActionPopover.Content>
        </ActionPopover.Root>
      </div>

      <Separator type="vertical" />

      <ActionPopover.Root>
        <ActionPopover.Trigger asChild>
          <IconButton
            icon={<MdMoreVert aria-hidden />}
            text="Tools"
            size="md"
            fullHeight
            className="w-16"
            {...TestHelper.buildTestObject('more-button')}
          />
        </ActionPopover.Trigger>

        <ActionPopover.Content side="bottom" sideOffset={-10} align="end">
          {children}

          <ActionPopover.Item
            actionPopoverItemType="button"
            leftIcon={<TbPlus aria-hidden className="text-neon" />}
            label={t('newWalletButtonLabel')}
            onClick={modalNavigateWrapper('create-wallet-step-1')}
            disabled={!isPasswordLogin}
            colorSchema="white"
            {...TestHelper.buildTestObject('new-wallet-button')}
          />

          <ActionPopover.Separator />

          <ActionPopover.Item
            actionPopoverItemType="button"
            leftIcon={<TbFileImport aria-hidden className="text-neon" />}
            label={t('importButtonLabel')}
            colorSchema="white"
            onClick={modalNavigateWrapper('import')}
            disabled={!isPasswordLogin}
          />

          <ActionPopover.Separator />

          <ActionPopover.Item
            actionPopoverItemType="button"
            leftIcon={<TbDeviceUsb aria-hidden className="rotate-45 text-neon" />}
            label={t('connectButtonLabel')}
            colorSchema="white"
            onClick={modalNavigateWrapper('connect-hardware-wallet')}
            {...TestHelper.buildTestObject('connect-hardware-wallet-button')}
          />
        </ActionPopover.Content>
      </ActionPopover.Root>
    </div>
  )
}
