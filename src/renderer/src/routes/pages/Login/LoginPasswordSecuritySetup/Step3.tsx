import { useTranslation } from 'react-i18next'
import { Location, useLocation } from 'react-router'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useShouldConfirmActionSelector } from '@renderer/hooks/useAuthSelector'
import { useNavigateReset } from '@renderer/hooks/useNavigateReset'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'

type TLocationState = {
  selectedFilePath: string
}

export const LoginPasswordSecuritySetupStep3Content = () => {
  const { state } = useLocation() as Location<TLocationState>
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.securitySetup.completedStep' })
  const { shouldConfirmAction } = useShouldConfirmActionSelector()
  const dispatch = useAppDispatch()
  const navigateReset = useNavigateReset()

  const handleIsShouldConfirmActionChange = (value: boolean) => {
    dispatch(authReducerActions.setShouldConfirmAction(value))
  }

  const handleOpenSelectedFilePath = async () => {
    await window.api.sendAsync('window:openFile', state.selectedFilePath)
  }

  const handleNavigateToWallet = () => {
    navigateReset('/wallets/overview')
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

        <Button
          label={t('buttonContinueLabel')}
          onClick={handleNavigateToWallet}
          className="mt-auto w-64"
          rightIcon={<MdOutlineAutoAwesome aria-hidden />}
          iconsOnEdge={false}
          {...TestHelper.buildTestObject('security-setup-open-your-wallet')}
        />
      </div>

      <div className="flex items-center justify-center gap-2 pt-2 text-white">
        <Checkbox
          id="should-confirm-action"
          checked={shouldConfirmAction}
          onCheckedChange={handleIsShouldConfirmActionChange}
        />
        <label htmlFor="should-confirm-action">{t('shouldConfirmActionPasswordCheckboxLabel')}</label>
      </div>
    </div>
  )
}
