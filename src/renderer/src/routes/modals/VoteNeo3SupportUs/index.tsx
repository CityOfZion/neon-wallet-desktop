import { Trans, useTranslation } from 'react-i18next'
import CozLogo from '@renderer/assets/images/coz-logo.svg?react'
import TbCheckbox from '@renderer/assets/images/tb-checkbox.svg?react'
import TbHeartHandshake from '@renderer/assets/images/tb-heart-handshake.svg?react'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Link } from '@renderer/components/Link'
import { COZ_WEBSITE_URL } from '@renderer/constants/urls'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TVoteNeo3Candidate } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  neo3Account: IAccountState
  cozCandidate: TVoteNeo3Candidate
}

type TActionsData = {
  dontShowAgain: boolean
}

export const VoteNeo3SupportUsModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'voteNeo3SupportUs' })
  const { modalEraseWrapper, modalNavigate } = useModalNavigate()
  const { neo3Account, cozCandidate } = useModalState<TLocationState>()
  const dispatch = useAppDispatch()

  const {
    actionData: { dontShowAgain },
    setData,
  } = useActions<TActionsData>({ dontShowAgain: false })

  const handleOnClose = () => {
    if (dontShowAgain) dispatch(settingsReducerActions.setCanShowVoteNeo3SupportUsModalAgain(false))
  }

  const handleChangeDontShowAgain = (checked: boolean) => {
    setData({ dontShowAgain: checked })
  }

  const handleGoToVoteNeo3ConfirmationModalForCoz = () => {
    modalNavigate('vote-neo3-confirmation', {
      replace: true,
      state: { neo3Account, candidate: cozCandidate },
    })
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

          <Button
            label={t('skipButtonLabel')}
            variant="card"
            colorSchema="gray"
            wide
            onClick={modalEraseWrapper('center')}
          />
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
