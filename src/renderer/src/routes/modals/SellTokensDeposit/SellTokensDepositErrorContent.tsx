import { useTranslation } from 'react-i18next'

type TProps = {
  errorMessage: string
}

export const SellTokensDepositErrorContent = ({ errorMessage }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.error' })

  return (
    <section className="flex flex-grow flex-col min-w-0 w-full text-gray-100">
      <h3 className="text-center text-md leading-5 mt-4 px-8">{t('text')}</h3>

      <div className="mt-8 flex flex-col gap-2 text-xs w-full">
        <p className="font-semibold uppercase">{t('label')}</p>
        <p className="bg-asphalt w-full p-3 rounded break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
          {errorMessage || t('default')}
        </p>
      </div>
    </section>
  )
}
