import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Textarea } from '@renderer/components/Textarea'

import { ClickupHelper } from '@renderer/helpers/ClickupHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import HiOutlineTicket from '@renderer/assets/images/hi-outline-ticket.svg?react'

import { SupportTicketSuccessContent } from './SupportTicketSuccessContent'

type TActionData = {
  email: string
  name: string
  description: string
}

const SupportTicketModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'supportTicket' })
  const { modalNavigateWrapper, modalNavigate } = useModalNavigate()

  const { actionData, handleAct, actionState, setError, setDataFromEventWrapper } = useActions<TActionData>({
    email: '',
    name: '',
    description: '',
  })

  const isDisabled = !actionData.name || !actionData.email || !actionData.description || actionState.isActing

  const onSubmit = async () => {
    const name = actionData.name.trim()
    const email = actionData.email.trim()
    const description = actionData.description.trim()

    if (!name) {
      setError('name', t('errors.nameRequired'))
      return
    }

    if (!email) {
      setError('email', t('errors.emailRequired'))
      return
    }

    try {
      await ClickupHelper.createSupportTicket({
        name,
        email,
        description,
      })

      modalNavigate('success', {
        replace: true,
        state: {
          heading: t('title'),
          subtitle: t('successContent.title'),
          headingIcon: <HiOutlineTicket aria-hidden />,
          content: <SupportTicketSuccessContent />,
        },
      })
    } catch {
      ToastHelper.error({ message: t('errors.submitError') })
    }
  }

  return (
    <SideModalLayout
      headingIcon={<HiOutlineTicket aria-hidden />}
      heading={t('title')}
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={handleAct(onSubmit)} className="flex h-full flex-col justify-between gap-y-6 px-6">
        <Input
          label={t('nameLabel')}
          maxLength={50}
          value={actionData.name}
          placeholder={t('namePlaceholder')}
          onChange={setDataFromEventWrapper('name')}
          errorMessage={actionState.errors.name}
        />
        <Input
          label={t('emailLabel')}
          maxLength={254}
          value={actionData.email}
          type="email"
          placeholder={t('emailPlaceholder')}
          onChange={setDataFromEventWrapper('email')}
          errorMessage={actionState.errors.email}
        />

        <Textarea
          value={actionData.description}
          placeholder={t('descriptionPlaceholder')}
          onChange={setDataFromEventWrapper('description')}
          className="max-h-70 min-h-70 overflow-y-auto"
          errorMessage={actionState.errors.description}
          label={t('descriptionLabel')}
          maxLength={3000}
        />

        <div className="mt-auto flex justify-center gap-x-4">
          <Button
            label={t('cancelButtonLabel')}
            colorSchema="gray"
            onClick={modalNavigateWrapper(-1)}
            disabled={actionState.isActing}
          />
          <Button
            type="submit"
            className="w-64"
            label={t('submitTicketButtonLabel')}
            disabled={isDisabled}
            loading={actionState.isActing}
          />
        </div>
      </form>
    </SideModalLayout>
  )
}

export default SupportTicketModal
