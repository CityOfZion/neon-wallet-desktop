import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'

type TLocationState = {
  nextUrl: string
  setCanNavigate(canNavigate: boolean): void
}

export const BuyAndSellTokensLeaveAlertModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'buyAndSellTokensLeaveAlert' })
  const navigate = useNavigate()
  const { modalErase } = useModalNavigate()
  const { nextUrl, setCanNavigate } = useModalState() as TLocationState

  const handleClose = () => {
    modalErase('center')
  }

  const handleContinue = () => {
    setCanNavigate(true)
    modalErase('center')
    navigate(nextUrl)
  }

  return (
    <CenterModalLayout
      contentClassName="flex flex-col items-center px-4 pt-4 pb-8 gap-y-8 flex-grow-0"
      {...TestHelper.buildTestObject('buy-and-sell-tokens-leave-alert-modal')}
    >
      <h2 className="text-center text-xl font-semibold text-white">{t('title')}</h2>

      <p className="text-center text-md leading-5 text-white">{t('description')}</p>

      <div className="mt-8 flex w-full items-center gap-x-4">
        <Button
          label={t('buttons.close')}
          className="w-full"
          variant="contained"
          colorSchema="neon"
          onClick={handleClose}
          {...TestHelper.buildTestObject('buy-and-sell-tokens-leave-alert-close-button')}
        />

        <Button
          label={t('buttons.continue')}
          className="w-full"
          variant="outlined"
          colorSchema="neon"
          onClick={handleContinue}
          {...TestHelper.buildTestObject('buy-and-sell-tokens-leave-alert-continue-button')}
        />
      </div>
    </CenterModalLayout>
  )
}
