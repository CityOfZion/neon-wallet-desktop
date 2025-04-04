import { Fragment, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { TbAlertTriangle, TbStepInto, TbStepOut } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Account } from '@cityofzion/blockchain-service'
import { IconButton } from '@renderer/components/IconButton'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useBalance } from '@renderer/hooks/useBalances'
import { useConnectHardwareWallet, useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useMigrationNeo3Validations } from '@renderer/hooks/useMigrationNeo3Validations'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useUnclaimed } from '@renderer/hooks/useUnclaimed'
import { CenterModalLayout } from '@renderer/layouts/CenterModal'
import { THardwareWalletInfo } from '@shared/@types/ipc'
import { IAccountState } from '@shared/@types/store'
import { match, P } from 'ts-pattern'

import { PrepareHardwareWalletAccounts } from './PrepareHardwareWalletAccounts'
import { PrepareHardwareWalletAddressItem } from './PrepareHardwareWalletAddressItem'
import { PrepareHardwareWalletContainer } from './PrepareHardwareWalletContainer'
import { PrepareHardwareWalletStatusConnection } from './PrepareHardwareWalletStatusConnection'
import { PrepareHardwareWalletTipInfo } from './PrepareHardwareWalletTipInfo'

type TLocationState = {
  account: IAccountState
}

type TActionsData = {
  isGoingToMigrationNeo3: boolean
  isNeo3StepDone: boolean
  isAddingNeo3Account: boolean
  neo3Account: Account<'neo3'> | null
  neo3WalletInfo: THardwareWalletInfo | null
}

export const PrepareHardwareWalletMigrationNeo3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })
  const { account } = useModalState<TLocationState>()
  const { modalErase } = useModalNavigate()
  const balanceQuery = useBalance(account)
  const unclaimedQuery = useUnclaimed(account)
  const { canMigrateToNeo3 } = useMigrationNeo3Validations({ account })
  const { createHardwareWallet } = useHardwareWalletActions()
  const navigate = useNavigate()

  const {
    actionData: { isGoingToMigrationNeo3, isNeo3StepDone, isAddingNeo3Account, neo3Account, neo3WalletInfo },
    actionState,
    setData,
  } = useActions<TActionsData>({
    isGoingToMigrationNeo3: false,
    isNeo3StepDone: false,
    isAddingNeo3Account: false,
    neo3Account: null,
    neo3WalletInfo: null,
  })

  const neo3ConnectHardwareWallet = useConnectHardwareWallet({
    onConnect: async walletsInfo => {
      setData({ neo3WalletInfo: walletsInfo.find(walletInfo => walletInfo.blockchain === 'neo3') })
    },
    enabled: !isNeo3StepDone,
    beforeConnectMs: 0,
    beforeConnectValidation: walletsInfo => {
      const neo3WalletInfo = walletsInfo.find(({ blockchain }) => blockchain === 'neo3')

      return !!neo3WalletInfo && neo3WalletInfo.accounts.length > 0
    },
  })

  const connectHardwareWallet = useConnectHardwareWallet({
    onConnect: async walletsInfo => {
      await createHardwareWallet(walletsInfo)
    },
    enabled: isNeo3StepDone,
    beforeConnectMs: 0,
    beforeConnectValidation: walletsInfo => {
      const walletInfo = walletsInfo.find(({ blockchain }) => blockchain === 'neoLegacy')

      return !!walletInfo && walletInfo.accounts.some(AccountHelper.predicate(account))
    },
  })

  const currentStep = match({ isGoingToMigrationNeo3, isNeo3StepDone, neo3WalletInfo })
    .with({ isGoingToMigrationNeo3: true }, () => 6)
    .with({ isNeo3StepDone: true }, () => 4)
    .with({ neo3WalletInfo: P.nonNullable }, () => 3)
    .otherwise(() => 2)

  const tokenBalances = balanceQuery.data?.tokensBalances ?? []
  const unclaimedResult = unclaimedQuery.data

  const handleClose = () => {
    modalErase('center')
  }

  const handleAddNeo3Account = async () => {
    if (isAddingNeo3Account || !neo3WalletInfo) return

    setData({ isAddingNeo3Account: true })

    try {
      const nextNeo3AccountOrder = neo3WalletInfo.accounts.length

      const nextNeo3Account = await window.api.sendAsync('addNewHardwareAccount', {
        index: nextNeo3AccountOrder,
        blockchain: neo3WalletInfo.blockchain,
      })

      setData({ neo3WalletInfo: { ...neo3WalletInfo, accounts: [...neo3WalletInfo.accounts, nextNeo3Account] } })
    } catch {
      ToastHelper.error({ message: t('messages.addNeo3AccountError'), duration: 8000 })
    } finally {
      setData({ isAddingNeo3Account: false })
    }
  }

  const handleSelectNeo3Account = (address: string) => {
    if (!neo3WalletInfo) return

    const neo3Account = neo3WalletInfo.accounts.find(account => account.address === address) as Account<'neo3'>

    setData({ neo3Account })
  }

  const handleDoNeo3Step = () => {
    setData({ isNeo3StepDone: true })
  }

  const handleGoToMigrationNeo3 = async () => {
    setData({ isGoingToMigrationNeo3: true })

    await UtilsHelper.sleep(2000)

    handleClose()

    await UtilsHelper.sleep(200)

    navigate('/app/migration-neo3', { state: { account, neo3Account, neo3WalletInfo } })
  }

  useEffect(() => {
    if (
      account.blockchain !== 'neoLegacy' ||
      (!balanceQuery.isLoading && !unclaimedQuery.isLoading && !canMigrateToNeo3({ tokenBalances, unclaimedResult }))
    )
      handleClose()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceQuery.isLoading, unclaimedQuery.isLoading, tokenBalances, unclaimedResult])

  return (
    <CenterModalLayout
      contentClassName="flex flex-col items-center pt-0"
      className="overflow-y-auto"
      headerComponent={
        <header
          className={StyleHelper.mergeStyles('flex items-center pt-5', {
            'justify-between': isNeo3StepDone,
            'justify-end': !isNeo3StepDone,
          })}
        >
          {isNeo3StepDone && (
            <p className="flex items-center gap-x-3 text-orange text-xs max-w-[256px]">
              <TbAlertTriangle aria-hidden={true} className="h-5 w-5 min-h-5 min-w-5" />

              {t('labels.hardwareWalletAlert')}
            </p>
          )}

          <IconButton
            icon={<MdClose aria-hidden={true} className="fill-white" />}
            size="md"
            compacted
            onClick={handleClose}
          />
        </header>
      }
    >
      {!isNeo3StepDone ? (
        <PrepareHardwareWalletContainer
          currentStep={currentStep}
          buttonProps={{
            label: t('buttons.continue'),
            disabled: !neo3Account,
            onClick: handleDoNeo3Step,
          }}
        >
          <div className="flex flex-col items-center w-full max-w-[420px] mx-auto gap-y-4">
            <p className="text-lg text-gray-100 leading-4">{t('labels.connected')}</p>

            <h2 className="text-1xl text-white leading-8 mb-2">{t('labels.navigateNeo3')}</h2>

            <p className="text-sm font-light text-gray-100 text-center w-full">{t('labels.prepareNeo3')}</p>

            <PrepareHardwareWalletTipInfo className="mt-2">
              <p className="text-sm font-light text-white w-full">
                <Trans t={t} i18nKey="labels.switchNeo3">
                  start
                  <strong className="font-bold">end</strong>
                </Trans>
              </p>
            </PrepareHardwareWalletTipInfo>
          </div>

          <PrepareHardwareWalletStatusConnection
            searchLabel={t('labels.searchingNeo3HardwareWallet')}
            connectHardwareWallet={neo3ConnectHardwareWallet}
          />

          {neo3WalletInfo && (
            <PrepareHardwareWalletAccounts
              account={neo3Account}
              walletInfo={neo3WalletInfo}
              isAddingAccount={isAddingNeo3Account}
              onAddAccount={handleAddNeo3Account}
              onSelectAccount={handleSelectNeo3Account}
            />
          )}
        </PrepareHardwareWalletContainer>
      ) : (
        <PrepareHardwareWalletContainer
          currentStep={currentStep}
          buttonProps={{
            label: t('buttons.confirmAndContinue'),
            disabled: !actionState.isValid || connectHardwareWallet.status !== 'connected',
            loading: isGoingToMigrationNeo3,
            onClick: handleGoToMigrationNeo3,
          }}
        >
          <h2 className="text-1xl text-white leading-8 mb-2">{t('labels.confirmation')}</h2>

          <div className="flex flex-col items-center w-full mx-auto gap-y-6 max-w-[480px]">
            <PrepareHardwareWalletAddressItem
              title={
                <Trans t={t} i18nKey="labels.fromHere">
                  start
                  <strong className="font-bold">end</strong>
                </Trans>
              }
              text={t('labels.sourceAddress')}
              address={account.address}
              icon={<TbStepOut />}
            />

            <PrepareHardwareWalletAddressItem
              title={
                <Trans t={t} i18nKey="labels.depositedHere">
                  start
                  <strong className="font-bold">end</strong>
                </Trans>
              }
              text={t('labels.receiverAddress')}
              address={neo3Account!.address}
              icon={<TbStepInto />}
            />
          </div>

          {!isGoingToMigrationNeo3 && (
            <Fragment>
              <PrepareHardwareWalletTipInfo className="max-w-[450px] mt-2">
                <strong className="text-sm text-white w-full font-bold">{t('labels.switchAccount')}</strong>
              </PrepareHardwareWalletTipInfo>

              <PrepareHardwareWalletStatusConnection
                searchLabel={t('labels.searchingHardwareWallet')}
                connectHardwareWallet={connectHardwareWallet}
              />
            </Fragment>
          )}
        </PrepareHardwareWalletContainer>
      )}
    </CenterModalLayout>
  )
}
