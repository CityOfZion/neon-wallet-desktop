import { SelectorHelper } from '@renderer/helpers/SelectorHelper'

import { createAppSelector, useAppSelector } from '@renderer/hooks/useRedux'

import { TConversation } from '@shared/types/store'

const selectConversations = createAppSelector(
  [({ auth }) => auth.data.applicationDataByLoginType, ({ auth }) => auth.memoryData.loginSession],
  (applicationDataByLoginType, loginSession) => {
    if (!loginSession?.type) return SelectorHelper.fallbackToEmptyArray<TConversation>()

    return SelectorHelper.fallbackToEmptyArray(applicationDataByLoginType[loginSession.type].conversations)
  }
)

const selectConversation = (id: string | null) =>
  createAppSelector(
    [({ auth }) => auth.data.applicationDataByLoginType, ({ auth }) => auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!id || !loginSession?.type) return undefined

      return applicationDataByLoginType[loginSession.type].conversations.find(conversation => conversation.id === id)
    }
  )

const selectIsNewConversation = (id: string | null) =>
  createAppSelector(
    [({ auth }) => auth.data.applicationDataByLoginType, ({ auth }) => auth.memoryData.loginSession],
    (applicationDataByLoginType, loginSession) => {
      if (!id || !loginSession?.type) return false

      return (
        applicationDataByLoginType[loginSession.type].conversations.findIndex(
          conversation => conversation.id === id
        ) === -1
      )
    }
  )

export const useConversationsSelector = () => {
  const { value, ref } = useAppSelector(selectConversations)

  return { conversations: value, conversationsRef: ref }
}

export const useConversationSelector = (id: string | null) => {
  const { value, ref } = useAppSelector(selectConversation(id))

  return { conversation: value, conversationRef: ref }
}

export const useIsNewConversationSelector = (id: string | null) => {
  const { value, ref } = useAppSelector(selectIsNewConversation(id))

  return { isNewConversation: value, isNewConversationRef: ref }
}

export const useConversationDraftTextSelector = (id: string | null) => {
  const { value, ref } = useAppSelector(({ auth }) => {
    if (!id) return ''

    return auth.memoryData.conversationDraftTexts[id] || ''
  })

  return { conversationDraftText: value, conversationDraftTextRef: ref }
}

export const useLastConversationIdSelector = () => {
  const { value, ref } = useAppSelector(({ auth }) => auth.memoryData.lastConversationId)

  return { lastConversationId: value, lastConversationIdRef: ref }
}
