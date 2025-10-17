import { useTranslation } from 'react-i18next'

type TProps = {
  errorMessage: string
}

export const SellTokensDepositErrorContent = ({ errorMessage }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'sellTokensDeposit.error' })

  return (
    <section className="flex w-full min-w-0 grow flex-col text-gray-100">
      <h3 className="mt-4 px-8 text-center text-base leading-5">{t('text')}</h3>

      <div className="mt-8 flex w-full flex-col gap-2 text-xs">
        <p className="font-semibold uppercase">{t('label')}</p>
        <p className="bg-asphalt max-h-48 w-full overflow-y-auto rounded-sm p-3 wrap-break-word whitespace-pre-wrap">
          {errorMessage || t('default')}
        </p>
      </div>
    </section>
  )
}
