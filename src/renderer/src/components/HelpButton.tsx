import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbHelp, TbMessage } from 'react-icons/tb'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { DISCORD_LINK, HELP_LINK } from '@renderer/constants/urls'
import { TestHelper } from '@renderer/helpers/TestHelper'

export const HelpButton = () => {
  const { t } = useTranslation('components', { keyPrefix: 'helpButton' })

  return (
    <ActionPopover.Root>
      <ActionPopover.Trigger asChild>
        <IconButton
          text={t('text')}
          className="hover:bg-yellow/15 hover:enabled:bg-yellow/15 aria-selected:bg-yellow/15 aria-selected:hover:bg-yellow/15 aria-expanded:bg-yellow/15 aria-expanded:hover:bg-yellow/15 min-w-16"
          colorSchema="yellow"
          size="md"
          icon={<TbHelp aria-hidden="true" />}
          {...TestHelper.buildTestObject('help-button')}
        />
      </ActionPopover.Trigger>

      <ActionPopover.Content
        side="top"
        color="yellow"
        className="mr-4 mt-[-10px]"
        contentClassName="bg-gray-900/50 backdrop-blur-sm"
        pointerClassName="left-[100%] -translate-x-[58px]"
        {...TestHelper.buildTestObject('help-content')}
      >
        <ActionPopover.Item
          actionPopoverItemType="link"
          label={t('list.chatWithUs')}
          to={DISCORD_LINK}
          target="_blank"
          colorSchema="white"
          iconsOnEdge={false}
          leftIcon={<TbMessage aria-hidden="true" className="text-yellow" />}
          {...TestHelper.buildTestObject('help-chat-with-us')}
        />

        <ActionPopover.Separator className="h-[2px] mx-2 w-[calc(100%_-_2)]" />

        <ActionPopover.Item
          actionPopoverItemType="link"
          label={t('list.reportProblem')}
          to={HELP_LINK}
          target="_blank"
          colorSchema="white"
          iconsOnEdge={false}
          leftIcon={<TbAlertTriangle aria-hidden="true" className="text-yellow" />}
          {...TestHelper.buildTestObject('help-report-problem')}
        />
      </ActionPopover.Content>
    </ActionPopover.Root>
  )
}
