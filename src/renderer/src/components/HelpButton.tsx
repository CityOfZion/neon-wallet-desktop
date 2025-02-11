import { useTranslation } from 'react-i18next'
import { TbHelp, TbMessage } from 'react-icons/tb'
import { ActionPopover } from '@renderer/components/ActionPopover'
import { IconButton } from '@renderer/components/IconButton'
import { DISCORD_LINK } from '@renderer/constants/urls'
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
        side="bottom"
        color="yellow"
        className="mt-[-10px]"
        contentClassName="bg-gray-900/60 backdrop-blur-sm"
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
          clickableProps={{ className: 'px-2' }}
          {...TestHelper.buildTestObject('help-chat-with-us')}
        />
      </ActionPopover.Content>
    </ActionPopover.Root>
  )
}
