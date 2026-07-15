import { ChangeEvent, KeyboardEvent, MouseEvent, SyntheticEvent, useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { IconButton } from '@renderer/components/IconButton'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'

import { useActions } from '@renderer/hooks/useActions'
import { useConversationSelector, useIsNewConversationSelector } from '@renderer/hooks/useConversationsSelector'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import TbDeviceFloppy from '@renderer/assets/images/tb-device-floppy.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'

import { AssistantChat, CONVERSATION_NAME_MAX_LENGTH } from './AssistantChat'
import { AssistantEmptyState } from './AssistantEmptyState'

type TProps = {
  conversationId: string | null
}

export const AssistantContent = ({ conversationId }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant.content' })
  const dispatch = useAppDispatch()
  const { conversation } = useConversationSelector(conversationId)
  const { isNewConversation } = useIsNewConversationSelector(conversationId)

  const {
    actionData: { isEditing, editName, editInputWidth },
    setData,
  } = useActions({
    isEditing: false,
    editName: '',
    editInputWidth: 0,
  })

  const editInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const trimmedEditName = editName.trim()

  const handleEdit = () => {
    if (!conversation) return
    if (titleRef.current) setData({ editInputWidth: titleRef.current.offsetWidth })

    setData({ isEditing: true, editName: conversation.name.slice(0, CONVERSATION_NAME_MAX_LENGTH) })
  }

  const handleCancel = () => {
    setData({ isEditing: false })
  }

  const handleEditNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData({ editName: event.target.value })
  }

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleKeyDown = ({ key }: KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Escape') handleCancel()
  }

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault()

    if (!trimmedEditName || !conversationId) return

    dispatch(authReducerActions.saveConversation({ id: conversationId, name: trimmedEditName }))

    handleCancel()
  }

  useEffect(() => {
    if (isEditing) editInputRef.current?.focus()
  }, [isEditing])

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-4 pt-1">
      <div className="flex h-12 max-h-12 min-h-12 w-full items-center gap-x-2">
        {isEditing ? (
          <form className="flex items-center gap-x-2" onSubmit={handleSubmit}>
            <div style={{ width: Math.min(482, Math.max(216, editInputWidth + 24)) }}>
              <Input
                ref={editInputRef}
                contentClassName="px-3"
                compacted
                value={editName}
                required
                maxLength={CONVERSATION_NAME_MAX_LENGTH}
                onChange={handleEditNameChange}
                onKeyDown={handleKeyDown}
                onBlur={handleCancel}
              />
            </div>

            <Tooltip title={t('saveButtonLabel')}>
              <IconButton
                type="submit"
                aria-label={t('saveButtonLabel')}
                size="sm"
                compacted
                disabled={!trimmedEditName}
                icon={<TbDeviceFloppy aria-hidden className="text-neon" />}
                onMouseDown={handleMouseDown}
              />
            </Tooltip>
          </form>
        ) : (
          <h2 ref={titleRef} className="text-sm text-white">
            {match({ conversation, isNewConversation })
              .with({ conversation: P.nonNullable }, data => data.conversation.name)
              .with({ isNewConversation: true }, () => t('titles.new'))
              .otherwise(() => t('titles.default'))}
          </h2>
        )}

        {conversation && !isEditing && (
          <Tooltip title={t('editButtonLabel')}>
            <IconButton
              aria-label={t('editButtonLabel')}
              size="sm"
              compacted
              icon={<TbPencil aria-hidden className="text-neon" />}
              onClick={handleEdit}
            />
          </Tooltip>
        )}
      </div>

      <Separator containerClassName="pb-4" />

      {conversationId ? (
        <AssistantChat key={conversationId} conversationId={conversationId} />
      ) : (
        <AssistantEmptyState />
      )}
    </div>
  )
}
