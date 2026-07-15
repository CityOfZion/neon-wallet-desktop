import { useRef } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'

import { Badge } from '@renderer/components/Badge'
import { Button } from '@renderer/components/Button'
import { NotFound } from '@renderer/components/NotFound'
import { Separator } from '@renderer/components/Separator'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useConversationsSelector, useIsNewConversationSelector } from '@renderer/hooks/useConversationsSelector'

import MdInfoOutline from '@renderer/assets/images/md-info-outline.svg?react'

import { AssistantConversationItem } from './AssistantConversationItem'

type TProps = {
  conversationId: string | null
  onSelectConversationId: (conversationId: string) => void
}

export const AssistantSidebar = ({ conversationId, onSelectConversationId }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant.sidebar' })
  const { conversations } = useConversationsSelector()
  const { isNewConversation } = useIsNewConversationSelector(conversationId)

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: conversations.length,
    overscan: 5,
    estimateSize: () => 34,
    getScrollElement: () => scrollRef.current,
  })

  const handleNewConversation = () => {
    if (isNewConversation) return

    onSelectConversationId(UtilsHelper.uuid())
  }

  return (
    <div className="bg-asphalt/50 flex h-full min-h-0 w-92 max-w-92 min-w-92 flex-col border-r border-gray-300/15 p-4 pt-1">
      <div className="flex h-12 max-h-12 min-h-12 items-center gap-x-2">
        <MdInfoOutline aria-hidden className="text-neon size-6" />

        <h2 className="text-sm">{t('title')}</h2>

        <Badge className="bg-orange/72">{t('betaBadgeLabel')}</Badge>
      </div>

      <Separator />

      <p className="mt-4 mb-2 text-xs text-gray-100">{t('description')}</p>

      <h3 className="mb-2 text-xs font-medium text-gray-100 uppercase">{t('listTitle')}</h3>

      <Separator />

      {conversations.length === 0 ? (
        <NotFound
          title={t('notFound.title')}
          description={t('notFound.description')}
          className="min-h-0 grow overflow-y-auto py-8"
        />
      ) : (
        <div ref={scrollRef} className="flex min-h-0 grow flex-col overflow-y-auto">
          <ul className="relative flex flex-col" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map(virtualItem => {
              const index = virtualItem.index
              const conversation = conversations[index]

              return (
                <AssistantConversationItem
                  key={conversation.id}
                  style={{ top: virtualItem.start }}
                  index={index}
                  selectedConversationId={conversationId}
                  conversation={conversation}
                  onSelectConversationId={onSelectConversationId}
                />
              )
            })}
          </ul>
        </div>
      )}

      <Separator />

      <Button
        label={t('newConversationButtonLabel')}
        type="button"
        className="mt-4 w-full"
        variant="contained"
        flat
        onClick={handleNewConversation}
      />
    </div>
  )
}
