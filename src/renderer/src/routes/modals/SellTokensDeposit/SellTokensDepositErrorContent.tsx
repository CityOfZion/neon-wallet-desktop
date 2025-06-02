import { useTranslation } from 'react-i18next'

type TProps = {
  errorMessage: string
}

export const SellTokensDepositErrorContent = ({ errorMessage }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.error' })

  return (
    <section className="flex w-full min-w-0 flex-grow flex-col text-gray-100">
      <h3 className="mt-4 px-8 text-center text-md leading-5">{t('text')}</h3>

      <div className="mt-8 flex w-full flex-col gap-2 text-xs">
        <p className="font-semibold uppercase">{t('label')}</p>
        <p className="max-h-48 w-full overflow-y-auto whitespace-pre-wrap break-words rounded bg-asphalt p-3">
          {errorMessage || t('default')}
        </p>
      </div>
    </section>
  )
}
