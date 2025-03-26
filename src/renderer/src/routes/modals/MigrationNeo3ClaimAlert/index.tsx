import { useTranslation } from 'react-i18next'
import { isClaimable } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  account: IAccountState
}

export const MigrationNeo3ClaimAlertModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrationNeo3ClaimAlert' })
  const { modalErase } = useModalNavigate()
  const { account } = useModalState<TLocationState>()

  const service = bsAggregator.blockchainServicesByName[account.blockchain]

  const handleClose = () => {
    modalErase('center')
  }

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center px-4 pt-2 pb-8 gap-y-8 flex-grow-0">
      <h2 className="text-white text-1xl text-center font-semibold">
        {t('title', { tokenSymbol: (isClaimable(service) ? service.claimToken.symbol : '') || 'token' })}
      </h2>

      <p className="text-center text-gray-100 text-md leading-5">{t('description')}</p>

      <Button
        label={t('buttons.understood')}
        className="w-full mt-8"
        textClassName="text-neon"
        variant="card"
        colorSchema="neon"
        onClick={handleClose}
      />
    </CenterModalLayout>
  )
}
