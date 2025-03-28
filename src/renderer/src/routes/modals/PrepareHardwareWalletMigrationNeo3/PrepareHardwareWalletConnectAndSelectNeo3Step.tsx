import { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MdAdd } from 'react-icons/md'
import { Account } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useConnectHardwareWallet } from '@renderer/hooks/useHardwareWallet'
import { useLoadingActions } from '@renderer/hooks/useLoadingActions'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { cloneDeep } from 'lodash'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { TPrepareHardwareWalletMigrationActionsData, TTPrepareHardwareWalletMigrationSetData } from './index'
import { PrepareHardwareWalletContinueButton } from './PrepareHardwareWalletContinueButton'
import { PrepareHardwareWalletStatusConnection } from './PrepareHardwareWalletStatusConnection'
import { PrepareHardwareWalletTipInfo } from './PrepareHardwareWalletTipInfo'

type TProps = {
  actionData: TPrepareHardwareWalletMigrationActionsData
  setData: TTPrepareHardwareWalletMigrationSetData
}

export const PrepareHardwareWalletConnectAndSelectNeo3Step = ({ actionData, setData }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3.connectAndSelectNeo3Step' })

  const neo3ConnectHardwareWallet = useConnectHardwareWallet({
    onConnect: async walletsInfo => {
      setData({
        neo3HardwareWalletInfo: walletsInfo.find(walletInfo => walletInfo.blockchain === 'neo3'),
        currentStep: EPrepareHardwareWalletMigrationStep.SELECT_NEO3_ACCOUNT,
      })
    },
    enabled: actionData.currentStep === EPrepareHardwareWalletMigrationStep.CONNECT_NEO3,
    beforeConnectMs: 0,
    beforeConnectValidation: walletsInfo =>
      walletsInfo.some(({ blockchain, accounts }) => blockchain === 'neo3' && accounts.length > 0),
  })

  const addAccountAction = useLoadingActions(async () => {
    try {
      if (!actionData.neo3HardwareWalletInfo) return

      const nextNeo3AccountOrder = actionData.neo3HardwareWalletInfo.accounts.length

      const nextNeo3Account = await window.api.sendAsync('addNewHardwareAccount', {
        index: nextNeo3AccountOrder,
        blockchain: actionData.neo3HardwareWalletInfo.blockchain,
      })

      const newNeo3HardwareWalletInfo = cloneDeep(actionData.neo3HardwareWalletInfo)
      newNeo3HardwareWalletInfo.accounts.push(nextNeo3Account)

      setData({
        neo3HardwareWalletInfo: newNeo3HardwareWalletInfo,
      })
    } catch (error) {
      ToastHelper.error({ message: t('addNeo3AccountError'), duration: 8000 })
    }
  })

  const handleSelectAccount = (account: Account<TBlockchainServiceKey>) => {
    setData({
      selectedNeo3HardwareServiceAccount: account,
    })
  }

  const handleContinue = () => {
    setData({ currentStep: EPrepareHardwareWalletMigrationStep.CONFIRM })
  }

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
        <PrepareHardwareWalletStatusConnection
          searchLabel={t('searchHardwareWalletLabel')}
          connectHardwareWallet={neo3ConnectHardwareWallet}
        />
      ) : (
        <div className="flex flex-col items-center mx-auto gap-y-4">
          {actionData.neo3HardwareWalletInfo && actionData.neo3HardwareWalletInfo.accounts.length > 0 && (
            <div className="flex flex-col flex-grow min-h-0 gap-y-2">
              <h3 className="text-gray-100 uppercase text-xs">{t('selectLabel')}</h3>

              <RadioGroup.Group
                value={actionData.selectedNeo3HardwareServiceAccount?.address}
                className="flex flex-col max-h-[200px] overflow-y-auto min-w-[400px] w-full rounded-md"
              >
                {actionData.neo3HardwareWalletInfo.accounts.map(account => (
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
            className="w-44"
            textClassName="text-neon"
            flat
            variant="card"
            loading={addAccountAction.isActing}
            iconsOnEdge={false}
            leftIcon={<MdAdd aria-hidden={true} className="text-neon" />}
            onClick={addAccountAction.handleAct}
          />
        </div>
      )}

      <PrepareHardwareWalletContinueButton
        disabled={!actionData.selectedNeo3HardwareServiceAccount}
        label={t('continueButtonLabel')}
        onClick={handleContinue}
      />
    </Fragment>
  )
}
