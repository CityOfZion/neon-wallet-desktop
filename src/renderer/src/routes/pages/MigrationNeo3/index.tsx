import { Trans, useTranslation } from 'react-i18next'
import { MdContentCopy } from 'react-icons/md'
import { TbArrowsExchange, TbCoin, TbDiamond, TbReceipt, TbStepOut, TbWallet } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { Account } from '@cityofzion/blockchain-service'
import {
  BSNeoLegacyConstants,
  CalculateNeo3MigrationAmountsResponse,
  CalculateNeoLegacyMigrationAmountsResponse,
} from '@cityofzion/bs-neo-legacy'
import { ActionCard } from '@renderer/components/ActionCard'
import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { Button } from '@renderer/components/Button'
import { HelpButton } from '@renderer/components/HelpButton'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import {
  NEO_LEGACY_GAS_TOKEN,
  NEO_LEGACY_NEO_TOKEN,
  NEO3_GAS_TOKEN,
  NEO3_NEO_TOKEN,
} from '@renderer/constants/migration-neo3'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountSelector, useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useMigrationNeo3Validations } from '@renderer/hooks/useMigrationNeo3Validations'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useMount } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useUnclaimed } from '@renderer/hooks/useUnclaimed'
import { useWalletByIdSelector } from '@renderer/hooks/useWalletSelector'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { thunks } from '@renderer/store/thunks'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { THardwareWalletInfo } from '@shared/@types/ipc'
import { IAccountState, TPendingMigrationNeo3 } from '@shared/@types/store'

import { MigrationNeo3AssetText } from './MigrationNeo3AssetText'
import { MigrationNeo3ListItemAmount } from './MigrationNeo3ListItemAmount'
import { MigrationNeo3ListItemFee } from './MigrationNeo3ListItemFee'
import { MigrationNeo3SideBar } from './MigrationNeo3SideBar'

type TActionsData = {
  neoLegacyServiceAccount?: Account<TBlockchainServiceKey>
  neo3ServiceAccount?: Account<TBlockchainServiceKey>
  neo3MigrationAmounts?: CalculateNeo3MigrationAmountsResponse
  neoLegacyMigrationAmounts?: CalculateNeoLegacyMigrationAmountsResponse
}

type TLocationState = {
  neoLegacyAccount: IAccountState
  neo3HardwareServiceAccount?: Account<TBlockchainServiceKey>
  neo3HardwareWalletInfo?: THardwareWalletInfo
}

export const MigrationNeo3Page = () => {
  const location = useLocation() as Location<TLocationState>
  const { neo3HardwareServiceAccount, neo3HardwareWalletInfo } = location.state

  const { t } = useTranslation('pages', { keyPrefix: 'migrationNeo3' })
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const navigate = useNavigate()
  const { doesAccountExist } = useAccountUtils()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { importAccount } = useBlockchainActions()
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { createHardwareWallet, isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()

  const neoLegacyAccountSelector = useAccountSelector(location.state.neoLegacyAccount)
  const neoLegacyAccount = neoLegacyAccountSelector.account!

  const { wallet } = useWalletByIdSelector(neoLegacyAccount.idWallet)
  const balanceQuery = useBalance(neoLegacyAccount)
  const unclaimedQuery = useUnclaimed(neoLegacyAccount)
  const { canMigrateToNeo3, neoLegacyService, shouldClaimBeforeMigrateToNeo3 } =
    useMigrationNeo3Validations(neoLegacyAccount)

  const { actionData, actionState, setData, handleAct } = useActions<TActionsData>({})

  const handleGoBack = () => {
    navigate(`/app/wallets/${neoLegacyAccount.id}/overview`)
  }

  const handleMigrateToNeo3 = async () => {
    if (
      !actionData.neo3MigrationAmounts ||
      !actionData.neoLegacyMigrationAmounts ||
      !actionData.neo3ServiceAccount ||
      !actionData.neoLegacyServiceAccount ||
      !wallet
    ) {
      return
    }

    const isHardwareAccount = neoLegacyAccount.type === 'hardware'

    if (isHardwareAccount) {
      const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(neoLegacyAccount)

      if (!isConnectedAndUnlocked) {
        ToastHelper.error({ message: t('messages.hardwareWalletNotConnectedOrLocked'), duration: 8000 })
        return
      }
    }

    try {
      const transactionHash = await neoLegacyService.migrate({
        account: actionData.neoLegacyServiceAccount,
        neo3Address: actionData.neo3ServiceAccount.address,
        neoLegacyMigrationAmounts: actionData.neoLegacyMigrationAmounts,
      })

      const doesNeo3AccountExist = doesAccountExist({
        address: actionData.neo3ServiceAccount.address,
        blockchain: actionData.neo3ServiceAccount.blockchain,
      })

      if (isHardwareAccount) {
        // We are using non-null assertion operator here because we validate in unMount hook if this value exist when is hardware account
        await createHardwareWallet([neo3HardwareWalletInfo!], { accountsType: 'watch' })
      } else if (!doesNeo3AccountExist) {
        await importAccount({
          ...actionData.neo3ServiceAccount,
          type: 'standard',
          wallet,
        })
      }

      const transfer = {
        account: neoLegacyAccount,
        to: BSNeoLegacyConstants.MIGRATION_COZ_LEGACY_ADDRESS,
        from: neoLegacyAccount.address,
        hash: transactionHash,
        time: DateHelper.getNowUnix(),
        fromAccount: neoLegacyAccount,
        isPending: true,
        isMigrate: true,
      }
      const migrationTransfers: TUseTransactionsTransfer[] = []

      if (actionData.neoLegacyMigrationAmounts.hasEnoughGasBalance && actionData.neoLegacyMigrationAmounts.gasBalance) {
        migrationTransfers.push({
          amount: actionData.neoLegacyMigrationAmounts.gasBalance.amount,
          asset: actionData.neoLegacyMigrationAmounts.gasBalance.token.symbol,
          assetHash: actionData.neoLegacyMigrationAmounts.gasBalance.token.hash,
          ...transfer,
        })
      }

      if (actionData.neoLegacyMigrationAmounts.hasEnoughNeoBalance && actionData.neoLegacyMigrationAmounts.neoBalance) {
        migrationTransfers.push({
          amount: actionData.neoLegacyMigrationAmounts.neoBalance.amount,
          asset: actionData.neoLegacyMigrationAmounts.neoBalance.token.symbol,
          assetHash: actionData.neoLegacyMigrationAmounts.neoBalance.token.hash,
          ...transfer,
        })
      }

      const pendingMigrationNeo3: TPendingMigrationNeo3 = {
        hash: transactionHash,
        neoLegacyAccount,
        neo3Address: actionData.neo3ServiceAccount.address,
        status: 'pending',
        neo3MigrationAmounts: actionData.neo3MigrationAmounts,
        neoLegacyMigrationAmounts: actionData.neoLegacyMigrationAmounts,
      }

      dispatch(
        thunks.waitMigration({
          migrationTransfers,
          pendingMigrationNeo3,
        })
      )

      navigate(`/app/wallets/${neoLegacyAccount.id}/transactions`)

      await UtilsHelper.sleep(100)

      modalNavigate('migration-neo3-status', { state: { hash: transactionHash } })

      ToastHelper.success({ message: t('messages.migrationSuccess') })
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t('messages.migrationError') })
    }
  }

  const { isMounting } = useMount(
    async () => {
      try {
        if (neoLegacyAccount.blockchain !== 'neoLegacy' || !wallet) {
          throw new Error(t('messages.accountIsNotNeoLegacy'))
        }

        // When these queries are loading, we need to wait for them to finish
        if (balanceQuery.isLoading || unclaimedQuery.isLoading) {
          return
        }

        if (!!unclaimedQuery.data && shouldClaimBeforeMigrateToNeo3(unclaimedQuery.data)) {
          modalNavigate('migration-neo3-claim-alert', { state: { neoLegacyAccount } })
          return
        }

        const tokenBalances = balanceQuery.data?.tokensBalances ?? []
        const unclaimedResult = unclaimedQuery.data
        if (!canMigrateToNeo3({ tokenBalances, unclaimedResult })) {
          throw new Error(t('messages.migrationNotAvailableError'))
        }

        const isHardwareWatchAccount = neoLegacyAccount.type === 'watch' && wallet.type === 'hardware'
        const isHardwareAccount = neoLegacyAccount.type === 'hardware' || isHardwareWatchAccount
        // It verify if the navigation is from prepare-hardware-wallet-migration-neo3 modal
        if (isHardwareAccount && (!neo3HardwareServiceAccount || !neo3HardwareWalletInfo)) {
          modalNavigate('prepare-hardware-wallet-migration-neo3', { state: { neoLegacyAccount } })
          return
        }

        let neo3MigrationAmounts: CalculateNeo3MigrationAmountsResponse
        let neoLegacyMigrationAmounts: CalculateNeoLegacyMigrationAmountsResponse
        try {
          neoLegacyMigrationAmounts = neoLegacyService.calculateNeoLegacyMigrationAmounts(tokenBalances)
          neo3MigrationAmounts = neoLegacyService.calculateNeo3MigrationAmounts(neoLegacyMigrationAmounts)
        } catch {
          throw new Error(t('messages.calculateValuesError'))
        }

        let key: string
        try {
          key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
            value: neoLegacyAccount.encryptedKey!,
            encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
          })
        } catch {
          throw new Error(t('messages.getKeyError'))
        }

        let neoLegacyServiceAccount: Account<TBlockchainServiceKey>
        try {
          neoLegacyServiceAccount = AccountHelper.getServiceAccount({ account: neoLegacyAccount, key })
        } catch (error) {
          console.error(error)

          throw new Error(t('messages.generateAccountError'))
        }

        let neo3ServiceAccount: Account<TBlockchainServiceKey>
        if (isHardwareAccount) {
          // We are using non-null assertion operator here because we validate in the beginning if this value exist when is hardware account
          neo3ServiceAccount = neo3HardwareServiceAccount!
        } else {
          try {
            const neo3Service = bsAggregator.blockchainServicesByName.neo3
            neo3ServiceAccount = neo3Service.generateAccountFromKey(key)
          } catch {
            throw new Error(t('messages.generateNeo3AccountError'))
          }
        }

        setData({ neo3ServiceAccount, neoLegacyServiceAccount, neo3MigrationAmounts, neoLegacyMigrationAmounts })
      } catch (error: any) {
        ToastHelper.error({ message: error.message })
        handleGoBack()
      }
    },
    [balanceQuery.isLoading, unclaimedQuery.isLoading, location.state],
    1000
  )

  return (
    <ContentLayout
      title={t('title')}
      titleIcon={<TbArrowsExchange aria-hidden={true} />}
      rightComponent={
        <div className="flex gap-x-2">
          <HelpButton />
        </div>
      }
    >
      <section className="flex rounded bg-gray-700/60 flex-grow min-h-0">
        <MigrationNeo3SideBar />

        <div className="min-h-0 flex-grow flex flex-col px-4 items-center">
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full h-12">
              <h2 className="text-white text-sm">{t('subtitle')}</h2>
            </div>

            <Separator />
          </div>

          {isMounting ? (
            <Loader containerClassName="flex-grow items-center " className="w-12 h-12 text-white" />
          ) : actionData.neo3MigrationAmounts &&
            actionData.neoLegacyMigrationAmounts &&
            actionData.neo3ServiceAccount &&
            actionData.neoLegacyServiceAccount ? (
            <div className="w-full overflow-y-auto">
              <div className="flex flex-col w-full max-w-[572px] mx-auto mt-6 gap-y-1 mb-12">
                <ActionCard>
                  <ActionStep
                    title={t('labels.assets')}
                    className="font-bold"
                    titleClassName="text-md"
                    headerClassName="gap-4"
                    leftIcon={<TbDiamond aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
                  />

                  <Separator />

                  <ActionStep
                    title={t('labels.migrate')}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <MigrationNeo3AssetText
                      neoLegacyMigrationAmounts={actionData.neoLegacyMigrationAmounts}
                      blockchain="neoLegacy"
                      gasTokenSymbol={NEO_LEGACY_GAS_TOKEN.symbol}
                      neoTokenSymbol={NEO_LEGACY_NEO_TOKEN.symbol}
                    />
                  </ActionStep>

                  <Separator />

                  <ActionStep
                    title={t('labels.receive')}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <MigrationNeo3AssetText
                      neoLegacyMigrationAmounts={actionData.neoLegacyMigrationAmounts}
                      blockchain="neo3"
                      gasTokenSymbol={NEO3_GAS_TOKEN.symbol}
                      neoTokenSymbol={NEO3_NEO_TOKEN.symbol}
                    />
                  </ActionStep>
                </ActionCard>

                <ActionStepSeparator className="-mt-1" />

                <ActionCard>
                  <ActionStep
                    title={t('labels.address')}
                    className="font-bold"
                    titleClassName="text-md"
                    headerClassName="gap-4"
                    leftIcon={<TbWallet aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
                  />

                  <Separator />

                  <ActionStep
                    title={tBlockchain(neoLegacyAccount.blockchain)}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <p className="text-gray-100 text-sm pr-2">{neoLegacyAccount.address}</p>
                  </ActionStep>

                  <Separator />

                  <ActionStep
                    title={tBlockchain('neo3')}
                    className="mb-4"
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <div className="flex items-center py-2 px-4 rounded bg-asphalt gap-x-2">
                      <p className="text-gray-100 text-sm">{actionData.neo3ServiceAccount.address}</p>

                      <IconButton
                        icon={<MdContentCopy aria-hidden={true} className="text-neon" />}
                        className="-mr-1"
                        compacted
                        onClick={UtilsHelper.copyToClipboard.bind(null, actionData.neo3ServiceAccount.address)}
                      />
                    </div>
                  </ActionStep>
                </ActionCard>

                <ActionStepSeparator className="-mt-1" />

                <ActionCard>
                  <ActionStep
                    title={t('labels.amounts')}
                    className="font-bold"
                    titleClassName="text-md"
                    headerClassName="gap-4"
                    leftIcon={<TbCoin aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
                  />

                  <Separator />

                  <ActionStep
                    title={
                      <p className="text-sm">
                        <Trans t={t} i18nKey="labels.amountYouGet">
                          start
                          <span className="text-gray-100">end</span>
                        </Trans>
                      </p>
                    }
                    className="items-start"
                    headerClassName="gap-4 py-5"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <ul className="flex flex-col pr-2 py-5 text-sm gap-y-2 self-center">
                      <MigrationNeo3ListItemAmount
                        amount={actionData.neo3MigrationAmounts.neoMigrationReceiveAmount}
                        symbol={NEO3_NEO_TOKEN.symbol}
                      />

                      <MigrationNeo3ListItemAmount
                        amount={actionData.neo3MigrationAmounts.gasMigrationReceiveAmount}
                        symbol={NEO3_GAS_TOKEN.symbol}
                      />
                    </ul>
                  </ActionStep>
                </ActionCard>

                <ActionCard className="mt-1">
                  <ActionStep
                    title={t('labels.fee')}
                    className="font-bold items-start"
                    titleClassName="text-md"
                    headerClassName="gap-4 py-5"
                    leftIcon={<TbReceipt aria-hidden={true} className="w-6 h-6 min-w-6 min-h-6" />}
                  >
                    <div className="flex font-normal text-sm pr-2 self-center">
                      <ul className="flex flex-col py-5 gap-y-2">
                        {actionData.neo3MigrationAmounts.neoMigrationTotalFees && (
                          <MigrationNeo3ListItemFee
                            fee={actionData.neo3MigrationAmounts.neoMigrationTotalFees}
                            hasAmount={actionData.neoLegacyMigrationAmounts.hasEnoughNeoBalance}
                            neo3Token={NEO3_NEO_TOKEN}
                          />
                        )}

                        {actionData.neo3MigrationAmounts.gasMigrationTotalFees && (
                          <MigrationNeo3ListItemFee
                            fee={actionData.neo3MigrationAmounts.gasMigrationTotalFees}
                            hasAmount={actionData.neoLegacyMigrationAmounts.hasEnoughGasBalance}
                            neo3Token={NEO3_GAS_TOKEN}
                          />
                        )}
                      </ul>
                    </div>
                  </ActionStep>
                </ActionCard>

                <Button
                  label={t('buttons.migrate')}
                  className="max-w-[20rem] mx-auto mt-10 w-full"
                  type="button"
                  iconsOnEdge={false}
                  loading={actionState.isActing}
                  disabled={actionState.isActing || !actionState.isValid}
                  leftIcon={<TbStepOut aria-hidden={true} />}
                  onClick={handleAct(handleMigrateToNeo3)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </ContentLayout>
  )
}
