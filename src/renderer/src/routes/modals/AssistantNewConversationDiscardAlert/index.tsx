import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import type { TModalState } from '@shared/types/modal'

export default () => {
  const { t } = useTranslation('modals', { keyPrefix: 'assistantNewConversationDiscardAlert' })
  const { modalErase } = useModalNavigate()
  const { onContinue } = useModalState<TModalState<'assistant-new-conversation-discard-alert'>>()

  const handleClose = () => {
    modalErase()
  }

  const handleContinue = () => {
    modalErase()
    onContinue()
  }

  return (
    <CenterModalLayout
      className="text-white"
      headerClassName="pt-4 pb-2"
      contentClassName="flex flex-col items-center px-2 pb-6 gap-y-2 grow-0 my-0 pt-0"
      size="xs"
    >
      <h2 className="text-center text-xl font-semibold">{t('title')}</h2>

      <p className="text-center text-base leading-5 font-light text-gray-100">{t('description')}</p>

      <div className="mt-10 flex w-full items-center gap-x-4">
        <Button
          label={t('closeButtonLabel')}
          variant="card"
          colorSchema="error"
          className="w-full"
          onClick={handleClose}
        />

        <Button
          label={t('continueButtonLabel')}
          variant="card"
          colorSchema="neon"
          className="w-full"
          onClick={handleContinue}
        />
      </div>
    </CenterModalLayout>
  )
}
