import { Fragment } from 'react'

import { TBSAccount } from '@cityofzion/blockchain-service'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useAccountMapSelector } from '@renderer/hooks/useAccountSelector'
import { useHardwareWalletActions, useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import MdAdd from '@renderer/assets/images/md-add.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

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
    } catch {
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

  const handleSelectAccount = (account: TBSAccount<TBlockchainServiceKey>) => {
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
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-y-4">
        <p className="text-lg leading-4 text-gray-100">{t('subtitle')}</p>

        <h2 className="text-1xl mb-2 leading-8 text-white">{t('title')}</h2>

        <p className="w-full text-center text-sm font-light text-gray-100">{t('description')}</p>

        <PrepareHardwareWalletTipInfo className="mt-2">
          <p className="w-full text-sm font-light text-white">
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
        <div className="mx-auto mb-4 flex flex-col items-center gap-y-2.5">
          {actionData.neo3HardwareAccounts && (
            <div className="flex min-h-0 grow flex-col gap-y-2">
              <h3 className="text-xs text-gray-100 uppercase">{t('selectLabel')}</h3>

              <RadioGroup.Group
                value={actionData.selectedNeo3HardwareServiceAccount?.address}
                className="flex max-h-[200px] w-full min-w-[400px] flex-col overflow-y-auto rounded-md"
              >
                {actionData.neo3HardwareAccounts.map(account => (
                  <RadioGroup.Item
                    key={account.address}
                    value={account.address}
                    className="bg-asphalt h-10 min-h-10"
                    separatorClassName="px-0"
                    onClick={handleSelectAccount.bind(null, account)}
                  >
                    <label className="text-sm text-white">{account.address}</label>
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
            leftIcon={<MdAdd aria-hidden className="text-neon" />}
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
