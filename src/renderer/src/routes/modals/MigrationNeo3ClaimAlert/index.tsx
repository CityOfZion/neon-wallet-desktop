import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { isClaimable } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  neoLegacyAccount: IAccountState
}

export const MigrationNeo3ClaimAlertModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrationNeo3ClaimAlert' })
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()
  const { neoLegacyAccount } = useModalState<TLocationState>()

  const service = bsAggregator.blockchainServicesByName[neoLegacyAccount.blockchain]

  const handleClose = async () => {
    // We need to go back to prevent the user to see a blank migration page

    await navigate(-1)

    modalErase('center')
  }

  if (!isClaimable(service)) {
    return null
  }

  return (
    <CenterModalLayout contentClassName="flex flex-col items-center px-4 pt-2 pb-8 gap-y-8 flex-grow-0">
      <h2 className="text-white text-1xl text-center font-semibold">
        {t('title', { tokenSymbol: service.claimToken.symbol })}
      </h2>

      <p className="text-center text-gray-100 text-md leading-5">
        {t('description', { tokenSymbol: service.claimToken.symbol })}
      </p>

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
