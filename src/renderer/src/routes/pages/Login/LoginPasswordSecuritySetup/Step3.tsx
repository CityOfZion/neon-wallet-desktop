import { useTranslation } from 'react-i18next'

import { Link } from '@renderer/components/Link'

import { TestHelper } from '@renderer/helpers/TestHelper'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

export const LoginPasswordSecuritySetupStep3Content = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.completedStep' })

  return (
    <div className="flex w-full grow flex-col items-center justify-between">
      <div className="mt-15 flex flex-col items-center">
        <h3 className="text-center text-sm text-white">{t('title')}</h3>

        <TbRosetteDiscountCheck aria-hidden className="text-blue mt-3 h-25 w-25 stroke-1" />
      </div>

      <Link
        label={t('buttonContinueLabel')}
        to="/wallets/overview"
        className="w-64"
        rightIcon={<MdOutlineAutoAwesome />}
        iconsOnEdge={false}
        {...TestHelper.buildTestObject('security-setup-open-your-wallet')}
      />
    </div>
  )
}
