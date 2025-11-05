import { TBSAccount } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Stepper } from '@renderer/components/Stepper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { CenterModalLayout } from '@renderer/layouts/CenterModal'

import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState } from '@shared/@types/store'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { PrepareHardwareWalletConfirmAndCompleteStep } from './PrepareHardwareWalletConfirmAndCompleteStep'
import { PrepareHardwareWalletConnectAndSelectNeo3Step } from './PrepareHardwareWalletConnectAndSelectNeo3Step'
import { PrepareHardwareWalletModalHeader } from './PrepareHardwareWalletModalHeader'

type TLocationState = {
  neoLegacyAccount: IAccountState
}

export type TPrepareHardwareWalletMigrationActionsData = {
  currentStep: EPrepareHardwareWalletMigrationStep
  selectedNeo3HardwareServiceAccount?: TBSAccount<TBlockchainServiceKey>
  neo3HardwareAccounts?: TBSAccount<TBlockchainServiceKey>[]
}

export type TTPrepareHardwareWalletMigrationSetData = ReturnType<
  typeof useActions<TPrepareHardwareWalletMigrationActionsData>
>['setData']

const PrepareHardwareWalletMigrationNeo3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })
  const { neoLegacyAccount } = useModalState<TLocationState>()

  const { actionData, setData } = useActions<TPrepareHardwareWalletMigrationActionsData>({
    currentStep: EPrepareHardwareWalletMigrationStep.CONNECT_NEO3,
  })

  return (
    <CenterModalLayout
      contentClassName="flex flex-col items-center pt-0 min-h-min"
      className="overflow-y-auto"
      headerComponent={<PrepareHardwareWalletModalHeader currentStep={actionData.currentStep} />}
    >
      <div className="mx-auto flex h-full w-full max-w-[600px] flex-col items-center gap-y-4">
        <p className="rounded-full bg-black px-6 py-2 text-center font-light text-gray-100">{t('title')}</p>

        <Stepper
          className="mt-4 mb-14 w-full max-w-[460px]"
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

export default PrepareHardwareWalletMigrationNeo3Modal
