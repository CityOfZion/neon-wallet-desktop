import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineAutoAwesome } from 'react-icons/md'
import { PiSealCheck } from 'react-icons/pi'
import { TbNotes } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as NeonWalletLogo } from '@renderer/assets/images/neon-wallet-full.svg'
import { Button } from '@renderer/components/Button'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

export const UpdateCompleteModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'updateComplete' })
  const { modalNavigateWrapper, modalNavigate } = useModalNavigate()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(settingsReducerActions.setHasOverTheAirUpdates(false))
  }, [dispatch])

  return (
    <CenterModalLayout
      contentClassName="flex flex-col w-full items-center justify-between"
      size="lg"
      closeOnEsc={false}
      closeOnOutsideClick={false}
    >
      <div className="text-center px-8 flex flex-col items-center">
        <NeonWalletLogo className="w-56 h-min" />
        <h2 className="text-2xl text-white mt-11">{t('title')}</h2>

        <p className="mt-7 text-gray-100 text-sm leading-5 w-full max-w-[31rem]">{t('description')}</p>

        <div className="w-36 h-36 rounded-full bg-asphalt flex items-center justify-center mt-9">
          <PiSealCheck className="text-blue w-[7rem] h-[7rem]" />
        </div>
      </div>

      <div className="flex w-full justify-center gap-x-2">
        <Button
          variant="text"
          label={t('buttonPatchNotesLabel')}
          rightIcon={<TbNotes />}
          className="w-full max-w-40"
          colorSchema="gray"
          iconsOnEdge={false}
          clickableProps={{ className: 'bg-gray-700' }}
          onClick={() => {
            modalNavigate(-1)
            navigate('/app/settings/personalisation/release-notes')
          }}
        />
        <Button
          label={t('buttonContinueLabel')}
          iconsOnEdge={false}
          rightIcon={<MdOutlineAutoAwesome />}
          className="w-full max-w-56"
          onClick={modalNavigateWrapper('download-wallet-mobile')}
        />
      </div>
    </CenterModalLayout>
  )
}
