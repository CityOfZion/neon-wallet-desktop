import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import type { TModalState } from '@shared/types/modal'

const BuyAndSellTokensLeaveAlertModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'buyAndSellTokensLeaveAlert' })
  const { modalErase } = useModalNavigate()
  const { onContinue } = useModalState<TModalState<'buy-and-sell-tokens-leave-alert'>>()

  const handleClose = () => {
    modalErase()
  }

  const handleContinue = () => {
    modalErase()
    onContinue()
  }

  return (
    <CenterModalLayout
      contentClassName="flex flex-col items-center px-4 pt-4 pb-8 gap-y-8 grow-0"
      size="xs"
      {...TestHelper.buildTestObject('buy-and-sell-tokens-leave-alert-modal')}
    >
      <h2 className="text-center text-xl font-semibold text-white">{t('title')}</h2>

      <p className="text-center text-base leading-5 text-white">{t('description')}</p>

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

export default BuyAndSellTokensLeaveAlertModal
