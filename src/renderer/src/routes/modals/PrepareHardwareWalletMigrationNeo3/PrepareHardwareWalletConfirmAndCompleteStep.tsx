import { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TbStepInto, TbStepOut } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useConnectHardwareWallet, useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { IAccountState } from '@shared/@types/store'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { TPrepareHardwareWalletMigrationActionsData, TTPrepareHardwareWalletMigrationSetData } from './index'
import { PrepareHardwareWalletAddressItem } from './PrepareHardwareWalletAddressItem'
import { PrepareHardwareWalletContinueButton } from './PrepareHardwareWalletContinueButton'
import { PrepareHardwareWalletStatusConnection } from './PrepareHardwareWalletStatusConnection'
import { PrepareHardwareWalletTipInfo } from './PrepareHardwareWalletTipInfo'

type TProps = {
  neoLegacyAccount: IAccountState
  actionData: TPrepareHardwareWalletMigrationActionsData
  setData: TTPrepareHardwareWalletMigrationSetData
}

export const PrepareHardwareWalletConfirmAndCompleteStep = ({ neoLegacyAccount, actionData, setData }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.confirmAndCompleteStep' })
  const { createHardwareWallet } = useHardwareWalletActions()
  const { modalErase } = useModalNavigate()
  const navigate = useNavigate()

  const connectHardwareWallet = useConnectHardwareWallet({
    onConnect: async walletsInfo => {
      await createHardwareWallet(walletsInfo)
    },
    enabled: actionData.currentStep === EPrepareHardwareWalletMigrationStep.CONFIRM,
    beforeConnectMs: 0,
    beforeConnectValidation: walletsInfo =>
      walletsInfo.some(
        ({ blockchain, accounts }) =>
          blockchain === 'neoLegacy' && accounts.some(AccountHelper.predicate(neoLegacyAccount))
      ),
  })

  const handleContinue = async () => {
    setData({ currentStep: EPrepareHardwareWalletMigrationStep.COMPLETE })

    await UtilsHelper.sleep(2000)

    modalErase('center')

    await UtilsHelper.sleep(200)

    navigate('/app/migration-neo3', {
      replace: true,
      state: {
        neoLegacyAccount,
        neo3HardwareServiceAccount: actionData.selectedNeo3HardwareServiceAccount,
        neo3HardwareWalletInfo: actionData.neo3HardwareWalletInfo,
      },
    })
  }

  return (
    <Fragment>
      <h2 className="text-1xl text-white leading-8 mb-2">{t('title')}</h2>

      <div className="flex flex-col items-center w-full mx-auto gap-y-6 max-w-[480px]">
        <PrepareHardwareWalletAddressItem
          title={
            <Trans t={t} i18nKey="sourceAddressTitle">
              start
              <strong className="font-bold">end</strong>
            </Trans>
          }
          label={t('sourceAddressLabel')}
          address={neoLegacyAccount.address}
          icon={<TbStepOut aria-hidden />}
        />

        <PrepareHardwareWalletAddressItem
          title={
            <Trans t={t} i18nKey="receiverAddressTitle">
              start
              <strong className="font-bold">end</strong>
            </Trans>
          }
          label={t('receiverAddressLabel')}
          address={actionData.selectedNeo3HardwareServiceAccount!.address}
          icon={<TbStepInto aria-hidden />}
        />
      </div>

      <PrepareHardwareWalletTipInfo className="max-w-[450px] mt-2">
        <strong className="text-sm text-white w-full font-bold">{t('tip')}</strong>
      </PrepareHardwareWalletTipInfo>

      <PrepareHardwareWalletStatusConnection
        searchLabel={t('searchHardwareWalletLabel')}
        connectHardwareWallet={connectHardwareWallet}
      />

      <PrepareHardwareWalletContinueButton
        label={t('continueButtonLabel')}
        disabled={connectHardwareWallet.status !== 'connected'}
        loading={actionData.currentStep === EPrepareHardwareWalletMigrationStep.COMPLETE}
        onClick={handleContinue}
      />
    </Fragment>
  )
}
