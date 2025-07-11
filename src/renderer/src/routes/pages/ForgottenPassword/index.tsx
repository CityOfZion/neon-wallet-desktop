import { useTranslation } from 'react-i18next'
import TbArrowRight from '@renderer/assets/images/tb-arrow-right.svg?react'
import { Banner } from '@renderer/components/Banner'
import { Link } from '@renderer/components/Link'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { WelcomeLayout } from '@renderer/layouts/Welcome'

export const ForgottenPasswordPage = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'forgottenPassword' })

  return (
    <WelcomeLayout heading={t('title')} withBackButton className="flex-col justify-between">
      <div className="flex max-w-[308px] flex-grow flex-col justify-center gap-y-8">
        <p className="text-center text-xl text-white">{t('text')}</p>

        <Banner type="warning" message={t('alertCard.text')} textClassName="py-4" iconClassName="text-orange" />
      </div>

      <Link
        to="/forgotten-password-confirm"
        label={t('links.continue')}
        colorSchema="error"
        variant="outlined"
        className="w-full max-w-[250px]"
        iconsOnEdge={false}
        rightIcon={<TbArrowRight aria-hidden={true} />}
        {...TestHelper.buildTestObject('forgotten-password-continue')}
      />
    </WelcomeLayout>
  )
}
