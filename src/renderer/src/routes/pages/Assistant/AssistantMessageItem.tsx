import { Fragment, memo, ReactNode, useCallback } from 'react'

import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'

import { DateHelper } from '@renderer/helpers/DateHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import type { TConversationMessage, TLanguage } from '@shared/types/store'

type TActionItem = {
  key: string
  label: ReactNode
  onClick: () => void
}

type TActionListProps = {
  items: TActionItem[]
  isLastMessage: boolean
}

const ActionList = memo(({ items, isLastMessage }: TActionListProps) => (
  <ul
    className={StyleHelper.mergeStyles(
      'mt-1.5 flex max-h-44 min-w-74 flex-col overflow-y-auto transition-opacity duration-200',
      { 'opacity-40': !isLastMessage }
    )}
  >
    {items.map(item => (
      <li key={item.key}>
        <Button
          type="button"
          variant="card"
          colorSchema="white"
          className="w-full"
          flat
          disabled={!isLastMessage}
          clickableProps={{ className: 'rounded-none border-b border-gray-300/30' }}
          label={item.label}
          onClick={item.onClick}
        />
      </li>
    ))}
  </ul>
))

type TProps = {
  message: TConversationMessage
  language: TLanguage
  isLast?: boolean
  onClick?: (text: string) => void
  children?: ReactNode
}

export const AssistantMessageItem = memo(({ message, language, isLast = false, onClick, children }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant.content' })
  const { author } = message
  const isUser = author === 'user'

  const handleClick = useCallback(
    (text: string) => {
      if (!isLast) return

      onClick?.(text)
    },
    [isLast, onClick]
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 16 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={StyleHelper.mergeStyles('flex max-w-[60%] flex-col items-start gap-y-1 self-start', {
        'items-end self-end': isUser,
      })}
    >
      <span className={StyleHelper.mergeStyles('text-blue text-xs font-medium', { 'text-neon': isUser })}>
        {t(`authorLabels.${author}`)}
      </span>

      <div
        className={StyleHelper.mergeStyles('bg-blue/20 w-full rounded-sm px-3 py-2 text-sm text-white', {
          'bg-neon/20': isUser,
        })}
      >
        {children || (
          <Fragment>
            {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

            {match(message)
              .with({ action: 'set-acting-account' }, { action: 'set-recipient-address' }, ({ data }) => (
                <ActionList
                  isLastMessage={isLast}
                  items={data.accounts.map(account => ({
                    key: account.id,
                    label: (
                      <span className="inline-block w-full truncate text-left font-medium text-gray-100">
                        <span className="font-bold text-white">{account.name}</span> (
                        <Tooltip title={account.address}>
                          <span>{StringHelper.truncateMiddle(account.address, 12)}</span>
                        </Tooltip>{' '}
                        - {account.walletName})
                      </span>
                    ),
                    onClick: handleClick.bind(null, `${account.name} (${account.address})`),
                  }))}
                />
              ))
              .with({ action: 'set-token' }, ({ data }) => (
                <ActionList
                  isLastMessage={isLast}
                  items={data.tokens.map(token => {
                    const name = token.symbol || token.name
                    const label = name || token.hash

                    return {
                      key: `${token.hash}-${name}`,
                      label: (
                        <span className="inline-block w-full truncate text-left font-medium text-gray-100">
                          <span className="font-bold text-white">{label}</span> ({token.amount})
                        </span>
                      ),
                      onClick: handleClick.bind(null, name ? `${name} (${token.hash})` : token.hash),
                    }
                  })}
                />
              ))
              .otherwise(() => null)}

            {message.date && (
              <Tooltip title={DateHelper.formatLocalized(message.date, { format: 'd MMMM yyyy, p', language })}>
                <p className="text-1xs mt-1.5 mr-0 ml-auto block w-fit cursor-default text-right text-gray-100">
                  {DateHelper.formatLocalized(message.date, { format: 'p', language })}
                </p>
              </Tooltip>
            )}
          </Fragment>
        )}
      </div>
    </motion.div>
  )
})
