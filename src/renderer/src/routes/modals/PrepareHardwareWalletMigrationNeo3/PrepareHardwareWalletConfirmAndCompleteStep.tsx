import { Fragment } from 'react'

import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useHardwareWalletActions, useHardwareWalletByUsb } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMountUnsafe } from '@renderer/hooks/useMount'

import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'
import { IAccountState } from '@shared/types/store'

import { EPrepareHardwareWalletMigrationStep } from './EPrepareHardwareWalletMigrationStep'
import { TPrepareHardwareWalletMigrationActionsData, TTPrepareHardwareWalletMigrationSetData } from './index'
import { PrepareHardwareWalletAddressItem } from './PrepareHardwareWalletAddressItem'
import { PrepareHardwareWalletContinueButton } from './PrepareHardwareWalletContinueButton'
import { PrepareHardwareWalletSearchAgainButton } from './PrepareHardwareWalletSearchAgainButton'
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

  const { connect, status, setStatus } = useHardwareWalletByUsb()

  const handleConnect = async () => {
    const accounts = await connect({ blockchain: 'neoLegacy' })

    const neoLegacyAccountExist = accounts.some(SharedAccountHelper.predicate(neoLegacyAccount))

    if (!neoLegacyAccountExist) {
      setStatus('not-connected')
      await window.api.sendAsync('hardwareWallet:disconnect')
      return
    }

    await createHardwareWallet(accounts)
  }

  const handleContinue = async () => {
    setData({ currentStep: EPrepareHardwareWalletMigrationStep.COMPLETE })

    await SharedUtilsHelper.sleep(2000)

    modalErase('center')

    await SharedUtilsHelper.sleep(200)

    navigate('/migration-neo3', {
      replace: true,
      state: {
        neoLegacyAccount,
        neo3HardwareServiceAccount: actionData.selectedNeo3HardwareServiceAccount,
      },
    })
  }

  useMountUnsafe(() => {
    handleConnect()
  })

  return (
    <Fragment>
      <h2 className="text-1xl mb-2 leading-8 text-white">{t('title')}</h2>

      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-y-6">
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

      <PrepareHardwareWalletTipInfo className="mt-2 max-w-[450px]">
        <strong className="w-full text-sm font-bold text-white">{t('tip')}</strong>
      </PrepareHardwareWalletTipInfo>

      <PrepareHardwareWalletStatusConnection searchLabel={t('searchHardwareWalletLabel')} status={status} />
      {status === 'not-connected' ? (
        <PrepareHardwareWalletSearchAgainButton onClick={handleConnect} />
      ) : (
        <PrepareHardwareWalletContinueButton
          label={t('continueButtonLabel')}
          disabled={status !== 'connected'}
          loading={actionData.currentStep === EPrepareHardwareWalletMigrationStep.COMPLETE}
          onClick={handleContinue}
        />
      )}
    </Fragment>
  )
}
