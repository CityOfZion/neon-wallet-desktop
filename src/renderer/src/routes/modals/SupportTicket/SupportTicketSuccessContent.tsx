import { useTranslation } from 'react-i18next'

export const SupportTicketSuccessContent = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'supportTicket.successContent' })

  return (
    <div className="mt-6 flex w-full flex-col items-center gap-2 text-center">
      <p className="text-sm text-gray-300">{t('description')}</p>
    </div>
  )
}
