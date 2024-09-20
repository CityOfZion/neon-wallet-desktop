import { useTranslation } from 'react-i18next'
import { TbArrowRight } from 'react-icons/tb'
import { Banner } from '@renderer/components/Banner'
import { Link } from '@renderer/components/Link'
import { WelcomeLayout } from '@renderer/layouts/Welcome'

export const ForgottenPasswordPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPassword' })

  return (
    <WelcomeLayout heading={t('title')} withBackButton className="flex-col justify-between">
      <div className="flex flex-col gap-y-8 justify-center flex-grow max-w-[308px]">
        <p className="text-white text-xl text-center">{t('text')}</p>

        <Banner type="warning" message={t('alertCard.text')} textClassName="py-4" iconClassName="text-orange" />
      </div>

      <Link
        testId="forgotten-password-continue"
        to="/forgotten-password-confirm"
        label={t('links.continue')}
        colorSchema="error"
        variant="outlined"
        className="w-full max-w-[250px]"
        iconsOnEdge={false}
        rightIcon={<TbArrowRight aria-hidden={true} />}
      />
    </WelcomeLayout>
  )
}
