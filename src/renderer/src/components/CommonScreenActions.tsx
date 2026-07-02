import { ComponentProps } from 'react'

import { useTranslation } from 'react-i18next'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'
import { CrispHelper } from '@renderer/helpers/CrispHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useHasNewNotificationsSelector, useLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import HiOutlineTicket from '@renderer/assets/images/hi-outline-ticket.svg?react'
import MdMoreVert from '@renderer/assets/images/md-more-vert.svg?react'
import TbBell from '@renderer/assets/images/tb-bell.svg?react'
import TbBrandDiscord from '@renderer/assets/images/tb-brand-discord.svg?react'
import TbDeviceUsb from '@renderer/assets/images/tb-device-usb.svg?react'
import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'
import TbHelp from '@renderer/assets/images/tb-help.svg?react'
import TbMessage from '@renderer/assets/images/tb-message.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'
import TbSearch from '@renderer/assets/images/tb-search.svg?react'

import { ActionPopover } from './ActionPopover'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Separator } from './Separator'

type TProps = ComponentProps<'div'>

export const CommonScreenActions = ({ children, className, ...props }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'commonScreenActions' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { hasNewNotifications } = useHasNewNotificationsSelector()
  const { loginSession } = useLoginSessionSelector()

  const isPasswordLogin = loginSession?.type === 'password'

  return (
    <div className={StyleHelper.mergeStyles('flex h-full', className)} {...props}>
      <div className="flex h-full gap-x-2">
        <Button
          variant="card"
          leftIcon={<TbSearch aria-hidden />}
          label={t('searchButtonLabel')}
          className="my-auto h-fit"
          colorSchema="neon"
          onClick={modalNavigateWrapper('search')}
          {...TestHelper.buildTestObject('search-button')}
        />

        <IconButton
          text={t('notificationButtonLabel')}
          size="sm"
          fullHeight
          className="min-w-16"
          icon={
            <div className="relative h-6 w-6">
              <TbBell className="h-6 w-6" aria-hidden />

              {hasNewNotifications && (
                <div
                  aria-label={t('unreadNotificationsIconLabel')}
                  className="border-asphalt bg-pink absolute top-0.5 right-0.5 box-content h-1 w-1 rounded-full border-2"
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
              className="hover:bg-yellow/15 hover:enabled:bg-yellow/15 aria-expanded:bg-yellow/15 aria-expanded:hover:bg-yellow/15 aria-selected:bg-yellow/15 aria-selected:hover:bg-yellow/15 min-w-16"
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
            contentClassName="bg-gray-900/50 backdrop-blur-md"
            {...TestHelper.buildTestObject('help-content')}
          >
            <ActionPopover.Item
              actionPopoverItemType="button"
              label={t('liveSupportButtonLabel')}
              colorSchema="white"
              iconsOnEdge={false}
              leftIcon={<TbMessage aria-hidden="true" className="text-yellow" />}
              onClick={CrispHelper.open}
              {...TestHelper.buildTestObject('help-live-support')}
            />

            <ActionPopover.Item
              actionPopoverItemType="button"
              label={t('openSupportTicketButtonLabel')}
              onClick={modalNavigateWrapper('support-ticket')}
              colorSchema="white"
              iconsOnEdge={false}
              leftIcon={<HiOutlineTicket aria-hidden="true" className="text-yellow" />}
            />

            <ActionPopover.Item
              actionPopoverItemType="link"
              label={t('discordLinkLabel')}
              to={ConstantsHelper.cozDiscordUrl}
              target="_blank"
              colorSchema="white"
              iconsOnEdge={false}
              leftIcon={<TbBrandDiscord aria-hidden="true" className="text-yellow" />}
              {...TestHelper.buildTestObject('help-discord')}
            />
          </ActionPopover.Content>
        </ActionPopover.Root>
      </div>

      <Separator type="vertical" />

      <ActionPopover.Root>
        <ActionPopover.Trigger asChild>
          <IconButton
            icon={<MdMoreVert aria-hidden />}
            text={t('toolsButtonLabel')}
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
            leftIcon={<TbDeviceUsb aria-hidden className="text-neon rotate-45" />}
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
