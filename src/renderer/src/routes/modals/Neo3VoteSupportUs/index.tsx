import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Link } from '@renderer/components/Link'

import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import CozLogo from '@renderer/assets/images/coz-logo.svg?react'
import TbCheckbox from '@renderer/assets/images/tb-checkbox.svg?react'
import TbHeartHandshake from '@renderer/assets/images/tb-heart-handshake.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TModalState } from '@shared/types/modal'

type TActionsData = {
  dontShowAgain: boolean
}

const Neo3VoteSupportUs = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'neo3VoteSupportUs' })
  const { modalEraseWrapper, modalNavigate } = useModalNavigate()
  const { neo3Account, cozCandidate } = useModalState<TModalState<'neo3-vote-support-us'>>()
  const dispatch = useAppDispatch()

  const {
    actionData: { dontShowAgain },
    setData,
  } = useActions<TActionsData>({ dontShowAgain: false })

  const handleOnClose = () => {
    if (dontShowAgain) {
      dispatch(settingsReducerActions.setCanShowNeo3VoteSupportUsModalAgain(false))
    }
  }

  const handleChangeDontShowAgain = (checked: boolean) => {
    setData({ dontShowAgain: checked })
  }

  const handleGoToNeo3VoteConfirmationModalForCoz = () => {
    modalNavigate('neo3-vote-confirmation', {
      replace: true,
      state: { neo3Account, candidate: cozCandidate },
    })
  }

  return (
    <CenterModalLayout
      heading={t('title')}
      headerClassName="pt-3"
      headingIcon={<TbHeartHandshake aria-hidden />}
      contentClassName="px-8 py-8 my-0 flex flex-col font-light text-sm text-white"
      onErase={handleOnClose}
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
            <Link
              to={ConstantsHelper.cozWebsiteUrl}
              target="_blank"
              variant="text-slim"
              clickableProps={{ className: 'inline' }}
            >
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
            leftIcon={<TbCheckbox aria-hidden />}
            onClick={handleGoToNeo3VoteConfirmationModalForCoz}
          />

          <Button label={t('skipButtonLabel')} variant="card" colorSchema="gray" wide onClick={modalEraseWrapper()} />
        </div>

        <div className="mt-2 mb-8 flex items-center justify-center font-normal">
          <Checkbox id="dontShowAgainCheckbox" checked={dontShowAgain} onCheckedChange={handleChangeDontShowAgain} />

          <label htmlFor="dontShowAgainCheckbox" className="cursor-pointer pl-2 select-none">
            {t('dontShowAgainLabel')}
          </label>
        </div>
      </div>
    </CenterModalLayout>
  )
}

export default Neo3VoteSupportUs
