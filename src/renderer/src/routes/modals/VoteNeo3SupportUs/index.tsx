import { Trans, useTranslation } from 'react-i18next'
import { TbCheckbox, TbHeartHandshake } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import CozLogo from '@renderer/assets/images/coz-logo.svg?react'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Link } from '@renderer/components/Link'
import { COZ_WEBSITE_URL } from '@renderer/constants/urls'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

type TActionsData = {
  dontShowAgain: boolean
}

export const VoteNeo3SupportUsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3SupportUs' })
  const { modalErase } = useModalNavigate()
  const dispatch = useDispatch()

  const {
    actionData: { dontShowAgain },
    setData,
  } = useActions<TActionsData>({ dontShowAgain: false })

  const handleClose = () => {
    modalErase('center')
  }

  const handleOnClose = () => {
    if (dontShowAgain) dispatch(settingsReducerActions.dontShowVoteNeo3SupportUsModalAgain())
  }

  const handleChangeDontShowAgain = (checked: boolean) => {
    setData({ dontShowAgain: checked })
  }

  // TODO: redirect to modal of confirm vote
  const handleGoToVoteNeo3ConfirmationModalForCoz = () => {
    handleClose()
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headerClassName="pt-3"
      headingIcon={<TbHeartHandshake aria-hidden={true} />}
      contentClassName="px-8 pb-0 pt-8 my-0 flex flex-col font-light text-sm text-white"
      onClose={handleOnClose}
    >
      <div className="flex flex-col gap-y-3">
        <CozLogo aria-label={t('cozLogoAlt')} className="mx-auto mb-3 w-full max-w-48" />

        <p>{t('hiLabel')}</p>

        <strong className="font-bold">{t('aboutNeonWalletDescription')}</strong>

        <p>{t('importantThingsLabel')}</p>

        <p>{t('youCanSupportUsLabel')}</p>

        <span>
          <Trans t={t} i18nKey="scanOurWebsite">
            start
            <Link to={COZ_WEBSITE_URL} target="_blank" variant="text-slim" clickableProps={{ className: 'inline' }}>
              end
            </Link>
          </Trans>
        </span>

        <p>{t('thankYouLabel')}</p>

        <p>{t('cozTeamLabel')}</p>

        <div className="mt-3 flex items-center justify-center gap-x-3">
          <Button
            label={t('voteForCozButtonLabel')}
            variant="contained"
            iconsOnEdge={false}
            wide
            leftIcon={<TbCheckbox aria-hidden={true} />}
            onClick={handleGoToVoteNeo3ConfirmationModalForCoz}
          />

          <Button label={t('skipButtonLabel')} variant="card" colorSchema="gray" wide onClick={handleClose} />
        </div>

        <div className="mt-2 flex items-center justify-center font-normal">
          <Checkbox id="dontShowAgainCheckbox" checked={dontShowAgain} onCheckedChange={handleChangeDontShowAgain} />

          <label htmlFor="dontShowAgainCheckbox" className="cursor-pointer select-none pl-2">
            {t('dontShowAgainLabel')}
          </label>
        </div>
      </div>
    </CenterModalLayout>
  )
}
