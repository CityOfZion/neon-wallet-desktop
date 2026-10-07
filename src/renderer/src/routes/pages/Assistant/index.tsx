import { useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useBlocker, useNavigate } from 'react-router'

import { CommonScreenActions } from '@renderer/components/CommonScreenActions'

import { useConversationsSelector, useLastConversationIdSelector } from '@renderer/hooks/useConversationsSelector'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { MainLayout } from '@renderer/layouts/Main'

import TbSparkles from '@renderer/assets/images/tb-sparkles.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

import { AssistantContent } from './AssistantContent'
import { AssistantSidebar } from './AssistantSidebar'

export default function () {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant' })
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { modalNavigate } = useModalNavigate()
  const { conversationsRef } = useConversationsSelector()
  const { lastConversationIdRef } = useLastConversationIdSelector()

  const shouldSkipBlockerRef = useRef(false)

  const isNewConversation = (id: string | null) => {
    return !!id && !conversationsRef.current.some(conversation => conversation.id === id)
  }

  const [conversationId, setConversationId] = useState<string | null>(() => {
    const lastId = lastConversationIdRef.current

    if (!lastId) return null

    return !isNewConversation(lastId) ? lastId : null
  })

  const handleOpenAssistantNewConversationDiscardAlertModal = (onContinue: () => void) => {
    modalNavigate('assistant-new-conversation-discard-alert', { state: { onContinue } })
  }

  const handleSelectConversationId = (id: string) => {
    if (isNewConversation(conversationId) && conversationsRef.current.some(conversation => conversation.id === id)) {
      handleOpenAssistantNewConversationDiscardAlertModal(() => {
        setConversationId(id)
        dispatch(authReducerActions.setLastConversationId(id))
      })

      return
    }

    setConversationId(id)

    if (!isNewConversation(id)) {
      dispatch(authReducerActions.setLastConversationId(id))
    }
  }

  useBlocker(({ nextLocation }) => {
    const nextUrl = nextLocation.pathname

    if (shouldSkipBlockerRef.current || !isNewConversation(conversationId) || nextUrl.includes('/login')) {
      return false
    }

    handleOpenAssistantNewConversationDiscardAlertModal(async () => {
      shouldSkipBlockerRef.current = true

      await SharedUtilsHelper.sleep(500)

      navigate(nextUrl)
    })

    return true
  })

  return (
    <MainLayout
      heading={
        <h1 className="flex items-center gap-x-2 text-sm font-bold">
          <TbSparkles aria-hidden className="text-neon size-6" />
          {t('title')}
        </h1>
      }
      rightComponent={<CommonScreenActions withTools={false} />}
    >
      <section className="flex h-full min-h-0 w-full rounded-sm bg-gray-800">
        <AssistantSidebar conversationId={conversationId} onSelectConversationId={handleSelectConversationId} />

        <AssistantContent conversationId={conversationId} />
      </section>
    </MainLayout>
  )
}
