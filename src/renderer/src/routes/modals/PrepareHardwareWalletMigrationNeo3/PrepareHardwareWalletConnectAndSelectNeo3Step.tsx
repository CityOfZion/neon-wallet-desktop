import { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MdAdd } from 'react-icons/md'
import { Account } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountMapSelector } from '@renderer/hooks/useAccountSelector'
import { useHardwareWalletActions, useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { TPrepareHardwareWalletMigrationActionsData, TTPrepareHardwareWalletMigrationSetData } from './index'
import { PrepareHardwareWalletContinueButton } from './PrepareHardwareWalletContinueButton'
import { PrepareHardwareWalletSearchAgainButton } from './PrepareHardwareWalletSearchAgainButton'
import { PrepareHardwareWalletStatusConnection } from './PrepareHardwareWalletStatusConnection'
import { PrepareHardwareWalletTipInfo } from './PrepareHardwareWalletTipInfo'

type TProps = {
  actionData: TPrepareHardwareWalletMigrationActionsData
  setData: TTPrepareHardwareWalletMigrationSetData
}

export const PrepareHardwareWalletConnectAndSelectNeo3Step = ({ actionData, setData }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.connectAndSelectNeo3Step' })
  const { createHardwareWallet, addNewHardwareAccount } = useHardwareWalletActions()
  const { connect, status } = useHardwareWalletByUsb()
  const { accountsMapRef } = useAccountMapSelector()

  const addAccountAction = useLoadingActions(async () => {
    try {
      if (!actionData.neo3HardwareAccounts) return

      const accountWithWallet = accountsMapRef.current.get(
        SharedAccountHelper.buildAccountKey(actionData.neo3HardwareAccounts[0])
      )
      if (!accountWithWallet) return

      const serviceAccount = await addNewHardwareAccount(accountWithWallet.wallet)

      setData({
        neo3HardwareAccounts: [...actionData.neo3HardwareAccounts, serviceAccount],
      })
    } catch (error) {
      ToastHelper.error({ message: t('addNeo3AccountError'), duration: 8000 })
    }
  })

  const handleConnect = async () => {
    const accounts = await connect({ blockchain: 'neo3' })

    await createHardwareWallet(accounts)

    setData({
      neo3HardwareAccounts: accounts,
      currentStep: EPrepareHardwareWalletMigrationStep.SELECT_NEO3_ACCOUNT,
    })
  }

  const handleSelectAccount = (account: Account<TBlockchainServiceKey>) => {
    setData({
      selectedNeo3HardwareServiceAccount: account,
    })
  }

  const handleContinue = () => {
    setData({ currentStep: EPrepareHardwareWalletMigrationStep.CONFIRM })
  }

  useMountUnsafe(() => {
    handleConnect()
  })

  return (
    <Fragment>
      <div className="flex flex-col items-center w-full max-w-[420px] mx-auto gap-y-4">
        <p className="text-lg text-gray-100 leading-4">{t('subtitle')}</p>

        <h2 className="text-1xl text-white leading-8 mb-2">{t('title')}</h2>

        <p className="text-sm font-light text-gray-100 text-center w-full">{t('description')}</p>

        <PrepareHardwareWalletTipInfo className="mt-2">
          <p className="text-sm font-light text-white w-full">
            <Trans t={t} i18nKey="tip">
              start
              <strong className="font-bold">end</strong>
            </Trans>
          </p>
        </PrepareHardwareWalletTipInfo>
      </div>

      {actionData.currentStep === EPrepareHardwareWalletMigrationStep.CONNECT_NEO3 ? (
        <PrepareHardwareWalletStatusConnection searchLabel={t('searchHardwareWalletLabel')} status={status} />
      ) : (
        <div className="flex flex-col items-center mx-auto gap-y-2.5 mb-4">
          {actionData.neo3HardwareAccounts && (
            <div className="flex flex-col flex-grow min-h-0 gap-y-2">
              <h3 className="text-gray-100 uppercase text-xs">{t('selectLabel')}</h3>

              <RadioGroup.Group
                value={actionData.selectedNeo3HardwareServiceAccount?.address}
                className="flex flex-col max-h-[200px] overflow-y-auto min-w-[400px] w-full rounded-md"
              >
                {actionData.neo3HardwareAccounts.map(account => (
                  <RadioGroup.Item
                    key={account.address}
                    value={account.address}
                    className="min-h-10 h-10 bg-asphalt"
                    separatorClassName="px-0"
                    onClick={handleSelectAccount.bind(null, account)}
                  >
                    <label className="text-white text-sm">{account.address}</label>
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                ))}
              </RadioGroup.Group>
            </div>
          )}

          <Button
            label={t('addAccountButtonLabel')}
            textClassName="text-neon"
            wide
            flat
            variant="card"
            loading={addAccountAction.isActing}
            iconsOnEdge={false}
            leftIcon={<MdAdd aria-hidden={true} className="text-neon" />}
            onClick={addAccountAction.handleAct}
          />
        </div>
      )}

      {status === 'not-connected' ? (
        <PrepareHardwareWalletSearchAgainButton onClick={handleConnect} />
      ) : (
        <PrepareHardwareWalletContinueButton
          disabled={!actionData.selectedNeo3HardwareServiceAccount}
          label={t('continueButtonLabel')}
          onClick={handleContinue}
        />
      )}
    </Fragment>
  )
}
