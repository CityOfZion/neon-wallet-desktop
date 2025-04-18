import { useTranslation } from 'react-i18next'
import { Account } from '@cityofzion/blockchain-service'
import { Stepper } from '@renderer/components/Stepper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { PrepareHardwareWalletConfirmAndCompleteStep } from './PrepareHardwareWalletConfirmAndCompleteStep'
import { PrepareHardwareWalletConnectAndSelectNeo3Step } from './PrepareHardwareWalletConnectAndSelectNeo3Step'
import { PrepareHardwareWalletModalHeader } from './PrepareHardwareWalletModalHeader'

type TLocationState = {
  neoLegacyAccount: IAccountState
}

export type TPrepareHardwareWalletMigrationActionsData = {
  currentStep: EPrepareHardwareWalletMigrationStep
  selectedNeo3HardwareServiceAccount?: Account<TBlockchainServiceKey>
  neo3HardwareAccounts?: Account<TBlockchainServiceKey>[]
}

export type TTPrepareHardwareWalletMigrationSetData = ReturnType<
  typeof useActions<TPrepareHardwareWalletMigrationActionsData>
>['setData']

export const PrepareHardwareWalletMigrationNeo3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })
  const { neoLegacyAccount } = useModalState<TLocationState>()

  const { actionData, setData } = useActions<TPrepareHardwareWalletMigrationActionsData>({
    currentStep: EPrepareHardwareWalletMigrationStep.CONNECT_NEO3,
  })

  return (
    <CenterModalLayout
      contentClassName="flex flex-col items-center pt-0"
      className="overflow-y-auto"
      headerComponent={<PrepareHardwareWalletModalHeader currentStep={actionData.currentStep} />}
    >
      <div className="flex flex-col items-center w-full mx-auto gap-y-4 h-full max-w-[600px]">
        <p className="bg-black rounded-full text-center py-2 px-6 text-gray-100 font-light">{t('title')}</p>

        <Stepper
          className="w-full max-w-[460px] mt-4 mb-14"
          textClassName="w-16"
          currentStep={actionData.currentStep}
          steps={t('steps', { returnObjects: true })}
        />

        {match(actionData.currentStep)
          .with(
            P.union(
              EPrepareHardwareWalletMigrationStep.CONNECT_NEO3,
              EPrepareHardwareWalletMigrationStep.SELECT_NEO3_ACCOUNT
            ),
            () => <PrepareHardwareWalletConnectAndSelectNeo3Step actionData={actionData} setData={setData} />
          )
          .with(
            P.union(EPrepareHardwareWalletMigrationStep.CONFIRM, EPrepareHardwareWalletMigrationStep.COMPLETE),
            () => (
              <PrepareHardwareWalletConfirmAndCompleteStep
                neoLegacyAccount={neoLegacyAccount}
                actionData={actionData}
                setData={setData}
              />
            )
          )
          .run()}
      </div>
    </CenterModalLayout>
  )
}
