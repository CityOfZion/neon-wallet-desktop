import { KeyboardEvent, useMemo, useRef } from 'react'

import { AssistantEngine, EAssistantEngineError, GeminiService } from '@cityofzion/assistant-engine'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cloneDeep } from 'lodash'
import { useTranslation } from 'react-i18next'
import { match } from 'ts-pattern'

import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { Skeleton } from '@renderer/components/Skeleton'
import { Textarea } from '@renderer/components/Textarea'
import { Tooltip } from '@renderer/components/Tooltip'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountsWithWalletSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useAssistantActions } from '@renderer/hooks/useAssistantActions'
import { useBalances } from '@renderer/hooks/useBalances'
import { useConversationDraftTextSelector, useConversationSelector } from '@renderer/hooks/useConversationsSelector'
import { useMount } from '@renderer/hooks/useMount'
import { usePressOnce } from '@renderer/hooks/usePressOnce'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useLanguageSelector } from '@renderer/hooks/useSettingsSelector'

import TbSend from '@renderer/assets/images/tb-send.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TConversationMessage } from '@shared/types/store'

import { AssistantMessageItem } from './AssistantMessageItem'
import { AssistantMessageSeparator } from './AssistantMessageSeparator'

const defaultError = 'UNKNOWN'
const errors = Object.values(EAssistantEngineError)
export const CONVERSATION_NAME_MAX_LENGTH = 75

type TRow =
  | { type: 'separator'; date: string }
  | { type: 'message'; message: TConversationMessage; isLast: boolean }
  | { type: 'loading' }

type TActionsData = {
  text: string
  isRedirecting: boolean
  isScrollReady: boolean
}

type TProps = {
  conversationId: string
}

export const AssistantChat = ({ conversationId }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'assistant.content' })
  const dispatch = useAppDispatch()
  const { redirect } = useAssistantActions()
  const { conversation } = useConversationSelector(conversationId)
  const { conversationDraftText } = useConversationDraftTextSelector(conversationId)
  const { accountsWithWalletRef } = useAccountsWithWalletSelector()
  const { language, languageRef } = useLanguageSelector()
  const balancesQuery = useBalances(accountsWithWalletRef.current)

  const {
    actionData: { text, isRedirecting, isScrollReady },
    setData,
    setDataFromEventWrapper,
  } = useActions<TActionsData>({
    text: conversationDraftText,
    isRedirecting: false,
    isScrollReady: false,
  })

  const assistantEngineRef = useRef<AssistantEngine | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isFirstScrollRef = useRef(true)

  const messages = useMemo(() => conversation?.messages || [], [conversation?.messages])

  const loadingMessage: TConversationMessage = { author: 'assistant', date: null, action: 'none', text: '', data: null }
  const isDisabled = !assistantEngineRef.current || !conversationId || isRedirecting
  const isSubmitButtonDisabled = isDisabled || !text.trim()

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault()

      startSubmit(text)
    }
  }

  const handleTextareaFocus = (delay?: number) => {
    const focus = () => {
      const element = textareaRef.current

      if (!element) return

      element.focus()
      element.setSelectionRange(element.value.length, element.value.length)
    }

    delay && delay > 0 ? setTimeout(focus, delay) : focus()
  }

  const [isSubmitting, startSubmit] = usePressOnce(async (text: string) => {
    const trimmedText = text.trim()

    if (isDisabled || !trimmedText) return

    setData({ text: '' })

    const message: TConversationMessage = {
      author: 'user',
      date: new Date().toJSON(),
      action: 'none',
      text: trimmedText,
      data: null,
    }

    const clonedMessages = [...cloneDeep(messages), message]

    dispatch(authReducerActions.setLastConversationId(conversationId))
    dispatch(
      authReducerActions.saveConversation({
        id: conversationId,
        name:
          conversation?.name || StringHelper.truncate(trimmedText.split('\n')[0].trim(), CONVERSATION_NAME_MAX_LENGTH),
        messages: [message],
      })
    )

    try {
      const response = await assistantEngineRef.current!.chat({
        messages: clonedMessages.map(({ author, text }) => ({ author, text })),
      })

      if (response.action === 'error') {
        const error = response.text as EAssistantEngineError

        ToastHelper.error({ message: t(`errors.${errors.includes(error) ? error : defaultError}`) })

        setData({ text: trimmedText })

        return
      }

      dispatch(
        authReducerActions.saveConversation({
          id: conversationId,
          messages: [{ author: 'assistant', date: new Date().toJSON(), ...response }],
        })
      )

      dispatch(authReducerActions.clearConversationDraftText(conversationId))

      redirect(response, () => setData({ isRedirecting: true }))
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t(`errors.${defaultError}`) })

      setData({ text: trimmedText })
    } finally {
      handleTextareaFocus(200)
    }
  })

  const rows = useMemo(() => {
    const result: TRow[] = []

    messages.forEach((message, index) => {
      const previousMessage = messages[index - 1]
      const isDateBoundary =
        !!message.date &&
        (!previousMessage?.date ||
          new Date(message.date).toDateString() !== new Date(previousMessage.date).toDateString())

      if (isDateBoundary) {
        result.push({ type: 'separator', date: message.date! })
      }

      result.push({ type: 'message', message, isLast: !isSubmitting && index === messages.length - 1 })
    })

    if (isSubmitting) result.push({ type: 'loading' })

    return result
  }, [isSubmitting, messages])

  const virtualizer = useVirtualizer({
    count: rows.length,
    overscan: 5,
    estimateSize: () => 76,
    getScrollElement: () => scrollContainerRef.current,
  })

  const init = () => {
    assistantEngineRef.current = new AssistantEngine({
      service: new GeminiService('gemini-3.1-flash-lite'),
      briefing: t('briefing'),
      language: languageRef.current.label,
      accounts: accountsWithWalletRef.current.map(account => ({
        id: account.id,
        address: account.address,
        blockchain: account.blockchain,
        name: account.name,
        walletId: account.idWallet,
        walletName: account.wallet.name,
        tokens: (balancesQuery.data.find(SharedAccountHelper.predicate(account))?.tokensBalances || []).map(
          ({ token, amount }) => ({ ...token, amount })
        ),
      })),
    })
  }

  useMount(
    () => {
      if (rows.length === 0) return

      const isFirstScroll = isFirstScrollRef.current

      const scroll = (behavior: ScrollBehavior = 'smooth') => {
        virtualizer.scrollToIndex(rows.length - 1, { align: 'end', behavior })
      }

      if (isFirstScroll) {
        const element = scrollContainerRef.current

        if (!element) return

        element.scrollTop = element.scrollHeight

        scroll('instant')
      } else {
        setTimeout(scroll, 200)
      }
    },
    [rows.length],
    0
  )

  useMount(
    () => {
      setData({ isScrollReady: false })

      handleTextareaFocus()

      isFirstScrollRef.current = false

      setData({ text: conversationDraftText })

      setTimeout(() => {
        if (!isFirstScrollRef.current) {
          setData({ isScrollReady: true })
        }
      }, 200)

      return () => {
        isFirstScrollRef.current = true

        setData({ isScrollReady: false })
      }
    },
    [conversationId],
    0
  )

  useMount(
    () => {
      if (!conversation) return

      const trimmedText = text.trim()

      if (!trimmedText) return

      dispatch(authReducerActions.saveConversationDraftText({ id: conversationId, text: trimmedText }))
    },
    [text, conversation, conversationId],
    0
  )

  useMount(
    () => {
      if (balancesQuery.isLoading) return

      init()
    },
    [balancesQuery.isLoading],
    0
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollContainerRef}
        className={StyleHelper.mergeStyles('flex w-full flex-1 overflow-x-hidden', {
          'overflow-y-auto pr-0': isScrollReady,
          'overflow-y-hidden': !isScrollReady,
          'pr-4':
            !isScrollReady &&
            !!scrollContainerRef.current &&
            scrollContainerRef.current.scrollHeight > scrollContainerRef.current.offsetHeight,
        })}
      >
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map(virtualItem => {
            const { index } = virtualItem
            const row = rows[index]
            const isLastItem = index === rows.length - 1
            const isSeparator = row.type === 'separator'

            return (
              <div
                key={index}
                ref={virtualizer.measureElement}
                data-index={index}
                className={StyleHelper.mergeStyles('absolute top-0 left-0 flex w-full flex-col pb-2', {
                  'pb-4': isSeparator || isLastItem,
                  'pt-2': isSeparator && index > 0,
                })}
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                {match(row)
                  .with({ type: 'separator' }, ({ date }) => (
                    <AssistantMessageSeparator date={date} language={language} />
                  ))
                  .with({ type: 'message' }, ({ message, isLast }) => (
                    <AssistantMessageItem message={message} language={language} isLast={isLast} onClick={startSubmit} />
                  ))
                  .with({ type: 'loading' }, () => (
                    <AssistantMessageItem message={loadingMessage} language={language}>
                      <div className="flex flex-col gap-y-1">
                        <Skeleton className="h-5 max-h-5 min-h-5 w-72 max-w-72 min-w-72 rounded-xs bg-white/20" />
                        <Skeleton className="h-5 max-h-5 min-h-5 w-32 max-w-32 min-w-32 rounded-xs bg-white/20" />
                      </div>
                    </AssistantMessageItem>
                  ))
                  .exhaustive()}
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      <div className="flex items-end gap-x-2 pt-4">
        <Textarea
          ref={textareaRef}
          aria-label={t('textLabel')}
          placeholder={t(`textPlaceholders.${isRedirecting ? 'redirecting' : 'default'}`)}
          value={text}
          className="max-h-40 min-h-12 overflow-y-auto"
          containerClassName={StyleHelper.mergeStyles({ 'animate-pulse': isRedirecting })}
          multiline
          autoFocus
          maxLength={2000}
          disabled={isSubmitting || isRedirecting}
          onKeyDown={handleKeyDown}
          onChange={setDataFromEventWrapper('text')}
        />

        <Tooltip title={t('sendButtonLabel')} contentProps={{ side: 'top' }}>
          <IconButton
            aria-label={t('sendButtonLabel')}
            size="md"
            compacted
            disabled={isSubmitButtonDisabled || isSubmitting}
            icon={<TbSend aria-hidden className="text-blue" />}
            onClick={startSubmit.bind(null, text)}
          />
        </Tooltip>
      </div>
    </div>
  )
}
