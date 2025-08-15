import { Trans, useTranslation } from 'react-i18next'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { Account, BSTokenHelper } from '@cityofzion/blockchain-service'
import {
  CalculateNeo3MigrationAmountsResponse,
  CalculateNeoLegacyMigrationAmountsResponse,
} from '@cityofzion/bs-neo-legacy'
import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import TbArrowsExchange from '@renderer/assets/images/tb-arrows-exchange.svg?react'
import TbCoin from '@renderer/assets/images/tb-coin.svg?react'
import TbDiamond from '@renderer/assets/images/tb-diamond.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import TbWallet from '@renderer/assets/images/tb-wallet.svg?react'
import VscCircleFilled from '@renderer/assets/images/vsc-circle-filled.svg?react'
import { ActionCard } from '@renderer/components/ActionCard'
import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { Button } from '@renderer/components/Button'
import { CommonScreenActions } from '@renderer/components/CommonScreenActions'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { NEO_LEGACY_GAS_TOKEN, NEO_LEGACY_NEO_TOKEN, NEO3_GAS_TOKEN, NEO3_NEO_TOKEN } from '@renderer/constants/tokens'
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
import { useWalletByIdSelector } from '@renderer/hooks/useWalletSelector'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { thunks } from '@renderer/store/thunks'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState, TMigrationNeo3 } from '@shared/@types/store'
import { SharedUtilsHelper } from '@shared/helpers/SharedUtilsHelper'

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
}

export const MigrationNeo3Page = () => {
  const location = useLocation() as Location<TLocationState>
  const { neo3HardwareServiceAccount } = location.state

  const { t } = useTranslation('pages', { keyPrefix: 'migrationNeo3' })
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const navigate = useNavigate()
  const { doesAccountExist } = useAccountUtils()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { importAccount } = useBlockchainActions()
  const { modalNavigate } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()

  const neoLegacyAccountSelector = useAccountSelector(location.state.neoLegacyAccount)
  const neoLegacyAccount = neoLegacyAccountSelector.account!

  const { wallet } = useWalletByIdSelector(neoLegacyAccount.idWallet)
  const balanceQuery = useBalance(neoLegacyAccount)
  const { canMigrateToNeo3, neoLegacyService } = useMigrationNeo3Validations(neoLegacyAccount)

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

      if (!isHardwareAccount && !doesNeo3AccountExist) {
        await importAccount({
          ...actionData.neo3ServiceAccount,
          type: 'standard',
          wallet,
        })
      }

      const pendingMigrationNeo3: TMigrationNeo3 = {
        hash: BSTokenHelper.normalizeHash(transactionHash),
        neoLegacyAccount,
        neo3Address: actionData.neo3ServiceAccount.address,
        status: 'pending',
        neo3MigrationAmounts: actionData.neo3MigrationAmounts,
        neoLegacyMigrationAmounts: actionData.neoLegacyMigrationAmounts,
        time: DateHelper.getNowUnix(),
      }

      dispatch(thunks.waitMigration(pendingMigrationNeo3))

      navigate(`/app/wallets/${neoLegacyAccount.id}/transactions`)

      await SharedUtilsHelper.sleep(100)

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

        // When this query is loading, we need to wait for it to finish
        if (balanceQuery.isLoading) return

        const tokenBalances = balanceQuery.data?.tokensBalances ?? []

        if (!canMigrateToNeo3({ tokenBalances })) {
          throw new Error(t('messages.migrationNotAvailableError'))
        }

        const isHardwareWatchAccount = neoLegacyAccount.type === 'watch' && wallet.type === 'hardware'
        const isHardwareAccount = neoLegacyAccount.type === 'hardware' || isHardwareWatchAccount
        // It verify if the navigation is from prepare-hardware-wallet-migration-neo3 modal
        if (isHardwareAccount && !neo3HardwareServiceAccount) {
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
    [balanceQuery.isLoading, location.state],
    1000
  )

  return (
    <ContentLayout
      title={t('title')}
      titleIcon={<TbArrowsExchange aria-hidden={true} />}
      rightComponent={<CommonScreenActions />}
    >
      <section className="flex min-h-0 flex-grow rounded bg-gray-800">
        <MigrationNeo3SideBar />

        <div className="flex min-h-0 flex-grow flex-col items-center px-4">
          <div className="flex w-full flex-col">
            <div className="flex h-12 w-full items-center">
              <h2 className="text-sm text-white">{t('subtitle')}</h2>
            </div>

            <Separator />
          </div>

          {isMounting ? (
            <Loader containerClassName="flex-grow items-center" className="h-12 w-12 text-white" />
          ) : actionData.neo3MigrationAmounts &&
            actionData.neoLegacyMigrationAmounts &&
            actionData.neo3ServiceAccount &&
            actionData.neoLegacyServiceAccount ? (
            <div className="w-full overflow-y-auto">
              <div className="mx-auto mb-12 mt-6 flex w-full max-w-[572px] flex-col gap-y-1">
                <ActionCard>
                  <ActionStep
                    title={t('labels.assets')}
                    className="font-bold"
                    titleClassName="text-md"
                    headerClassName="gap-4"
                    leftIcon={<TbDiamond aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
                  />

                  <Separator />

                  <ActionStep
                    title={t('labels.migrate')}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-100" />}
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
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-100" />}
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
                    leftIcon={<TbWallet aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
                  />

                  <Separator />

                  <ActionStep
                    title={tBlockchain(neoLegacyAccount.blockchain)}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-100" />}
                  >
                    <p className="pr-2 text-sm text-gray-100">{neoLegacyAccount.address}</p>
                  </ActionStep>

                  <Separator />

                  <ActionStep
                    title={tBlockchain('neo3')}
                    className="mb-4"
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-100" />}
                  >
                    <div className="flex items-center gap-x-2 rounded bg-asphalt px-4 py-2">
                      <p className="text-sm text-gray-100">{actionData.neo3ServiceAccount.address}</p>

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
                    leftIcon={<TbCoin aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
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
                    leftIcon={<VscCircleFilled aria-hidden={true} className="h-2 w-2 text-gray-100" />}
                  >
                    <ul className="flex flex-col gap-y-2 self-center py-5 pr-2 text-sm">
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
                    className="items-start font-bold"
                    titleClassName="text-md"
                    headerClassName="gap-4 py-5"
                    leftIcon={<TbReceipt aria-hidden={true} className="h-6 min-h-6 w-6 min-w-6" />}
                  >
                    <div className="flex self-center pr-2 text-sm font-normal">
                      <ul className="flex flex-col gap-y-2 py-5">
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
                  className="mx-auto mt-10 w-full max-w-[20rem]"
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
