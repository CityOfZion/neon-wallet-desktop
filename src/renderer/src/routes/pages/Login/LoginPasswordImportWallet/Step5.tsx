import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { ButtonDownloadPasswordQRCode } from '@renderer/components/ButtonDownloadPasswordQRCode'
import { Checkbox } from '@renderer/components/Checkbox'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useShouldConfirmActionSelector } from '@renderer/hooks/useAuthSelector'
import { useNavigateReset } from '@renderer/hooks/useNavigateReset'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import MdOutlineAutoAwesome from '@renderer/assets/images/md-outline-auto-awesome.svg?react'
import TbRosetteDiscountCheck from '@renderer/assets/images/tb-rosette-discount-check.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'

export const LoginPasswordImportWalletStep5Content = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'welcome.importWallet.completedStep' })
  const { shouldConfirmAction } = useShouldConfirmActionSelector()
  const dispatch = useAppDispatch()
  const navigateReset = useNavigateReset()

  const handleIsShouldConfirmActionChange = (value: boolean) => {
    dispatch(authReducerActions.setShouldConfirmAction(value))
  }

  const handleNavigateToWallet = () => {
    navigateReset('/wallets/overview')
  }

  return (
    <Fragment>
      <div className="flex grow flex-col items-center">
        <p className="mt-15 text-sm text-white">{t('title')}</p>

        <TbRosetteDiscountCheck aria-hidden className="text-blue mt-3 h-25 w-25 stroke-1" />
      </div>

      <div className="mt-2 flex flex-col gap-3 px-4">
        <ButtonDownloadPasswordQRCode />

        <Button
          onClick={handleNavigateToWallet}
          label={t('openWalletButtonLabel')}
          rightIcon={<MdOutlineAutoAwesome aria-hidden />}
          variant="contained"
          iconsOnEdge={false}
          {...TestHelper.buildTestObject('import-wallet-open-your-wallet')}
        />
      </div>

      <div className="flex items-center justify-center gap-2 pt-4 text-white">
        <Checkbox
          id="should-confirm-action"
          checked={shouldConfirmAction}
          onCheckedChange={handleIsShouldConfirmActionChange}
        />
        <label htmlFor="should-confirm-action">{t('shouldConfirmActionPasswordCheckboxLabel')}</label>
      </div>
    </Fragment>
  )
}
