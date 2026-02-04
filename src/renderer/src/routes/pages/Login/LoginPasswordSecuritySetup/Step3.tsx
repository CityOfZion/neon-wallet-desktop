import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Link } from '@renderer/components/Link'

import { TestHelper } from '@renderer/helpers/TestHelper'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

type TLocationState = {
  selectedFilePath: string
}

export const LoginPasswordSecuritySetupStep3Content = () => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.completedStep' })

  const handleOpenSelectedFilePath = async () => {
    await window.api.sendAsync('window:openFile', state.selectedFilePath)
  }

  return (
    <div className="flex w-full grow flex-col items-center gap-y-4">
      <div className="mt-10 flex flex-col items-center">
        <h3 className="text-center text-lg text-white">{t('title')}</h3>

        <TbRosetteDiscountCheck aria-hidden className="text-blue mt-3 size-30 stroke-1" />
      </div>

      <div className="mt-auto flex gap-4">
        <Button
          variant="outlined"
          label={t('locateBackupFileButtonLabel')}
          onClick={handleOpenSelectedFilePath}
          className="w-40"
          type="button"
        />

        <Link
          label={t('buttonContinueLabel')}
          to="/wallets/overview"
          className="mt-auto w-64"
          rightIcon={<MdOutlineAutoAwesome aria-hidden />}
          iconsOnEdge={false}
          {...TestHelper.buildTestObject('security-setup-open-your-wallet')}
        />
      </div>
    </div>
  )
}
