import { useTranslation } from 'react-i18next'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { TbRosetteDiscountCheck } from 'react-icons/tb'
import { Link } from '@renderer/components/Link'
import { TestHelper } from '@renderer/helpers/TestHelper'

export const WelcomeSecuritySetupStep3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.step3' })

  return (
    <div className="flex w-full flex-grow flex-col items-center justify-between">
      <div className="mt-15 flex flex-col items-center">
        <h3 className="text-center text-sm text-white">{t('title')}</h3>

        <TbRosetteDiscountCheck aria-hidden={true} className="mt-3 h-[6.25rem] w-[6.25rem] stroke-1 text-blue" />
      </div>

      <Link
        label={t('buttonContinueLabel')}
        to="/app/portfolio"
        className="w-64"
        rightIcon={<MdOutlineAutoAwesome />}
        iconsOnEdge={false}
        {...TestHelper.buildTestObject('security-setup-open-your-wallet')}
      />
    </div>
  )
}
