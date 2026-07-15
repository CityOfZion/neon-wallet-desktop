import { type ComponentProps, useMemo } from 'react'

import { differenceInCalendarDays, format, isToday, isYesterday } from 'date-fns'
import { motion } from 'motion/react'

import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'

import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import { TConversation } from '@shared/types/store'

type TProps = ComponentProps<typeof motion.li> & {
  index: number
  selectedConversationId: string | null
  conversation: TConversation
  onSelectConversationId: (conversationId: string) => void
}

export const AssistantConversationItem = ({
  index,
  selectedConversationId,
  conversation: { id, name, messages, date },
  onSelectConversationId,
  ...props
}: TProps) => {
  const { language } = useLanguageSelector()

  const isSelected = selectedConversationId === id
  const isEven = index % 2 === 0
  const locale = DateHelper.dateFnsLocaleByLanguage[language.value]

  const lastMessageDateString = useMemo(
    () => [...messages].reverse().find(message => message.date)?.date || date,
    [date, messages]
  )

  const formattedDate = useMemo(() => {
    const lastMessageDate = new Date(lastMessageDateString)

    if (isToday(lastMessageDate)) return format(lastMessageDate, 'p', { locale })

    if (isYesterday(lastMessageDate)) {
      const raw = new Intl.RelativeTimeFormat(language.value, { numeric: 'auto' }).format(-1, 'day')

      return StringHelper.capitalize(raw)
    }

    if (differenceInCalendarDays(new Date(), lastMessageDate) < 7) return format(lastMessageDate, 'EEEE', { locale })

    return format(lastMessageDate, 'P', { locale })
  }, [language.value, lastMessageDateString, locale])

  return (
    <motion.li
      className="absolute w-full"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      <Button
        aria-selected={isSelected}
        label={
          <span className="flex w-full items-center justify-between whitespace-break-spaces">
            <span className="truncate text-left">{name}</span>
            <Tooltip title={DateHelper.formatLocalized(lastMessageDateString, { format: 'P, p', language })}>
              <span
                className={StyleHelper.mergeStyles(
                  'text-1xs shrink-0 text-right text-gray-300 transition-colors duration-200',
                  {
                    'text-white': isSelected,
                  }
                )}
              >{` ${formattedDate}`}</span>
            </Tooltip>
          </span>
        }
        type="button"
        variant="card"
        colorSchema={isSelected ? 'neon' : 'white'}
        className="h-8.5 max-h-8.5 min-h-8.5 w-full"
        flat
        clickableProps={{
          className: StyleHelper.mergeStyles('rounded-none group-aria-disabled:opacity-50', {
            'group-aria-disabled:bg-gray-300/25 group-aria-expanded:bg-gray-300/25 group-aria-selected:bg-gray-300/25 group-aria-[disabled=false]:bg-gray-300/10 hover:group-aria-[disabled=false]:bg-gray-300/25':
              !isEven,
            'group-aria-disabled:bg-neon/25 group-aria-expanded:bg-neon/25 group-aria-selected:bg-neon/25 group-aria-[disabled=false]:bg-neon/10 hover:group-aria-[disabled=false]:bg-neon/25':
              isSelected,
          }),
        }}
        onClick={onSelectConversationId.bind(null, id)}
      />
    </motion.li>
  )
}
