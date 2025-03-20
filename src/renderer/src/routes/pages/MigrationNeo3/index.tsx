import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { MdContentCopy } from 'react-icons/md'
import { TbArrowsExchange, TbCoin, TbDiamond, TbReceipt, TbStepOut, TbWallet } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import {
  Account,
  CalculateToMigrateToNeo3ValuesResponse,
  hasLedger,
  hasMigrationNeo3,
} from '@cityofzion/blockchain-service'
import { BSNeoLegacyConstants } from '@cityofzion/bs-neo-legacy'
import { ActionCard } from '@renderer/components/ActionCard'
import { ActionStep } from '@renderer/components/ActionStep'
import { ActionStepSeparator } from '@renderer/components/ActionStepSeparator'
import { Button } from '@renderer/components/Button'
import { HelpButton } from '@renderer/components/HelpButton'
import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { Separator } from '@renderer/components/Separator'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { DateHelper } from '@renderer/helpers/DateHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useAccountsSelector, useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useBalance } from '@renderer/hooks/useBalances'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useHardwareWalletActions } from '@renderer/hooks/useHardwareWallet'
import { useMigrationNeo3Validations } from '@renderer/hooks/useMigrationNeo3Validations'
import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useWalletByIdSelector } from '@renderer/hooks/useWalletSelector'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { thunks } from '@renderer/store/thunks'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { TUseTransactionsTransfer } from '@shared/@types/hooks'
import { THardwareWalletInfo } from '@shared/@types/ipc'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'
import { match } from 'ts-pattern'

import { MigrationNeo3AssetText } from './MigrationNeo3AssetText'
import { MigrationNeo3ListItemAmount } from './MigrationNeo3ListItemAmount'
import { MigrationNeo3ListItemFee } from './MigrationNeo3ListItemFee'
import { MigrationNeo3SideBar } from './MigrationNeo3SideBar'

type TActionsData = {
  serviceAccount: Account<TBlockchainServiceKey> | null
  neo3Account: Account<'neo3'> | null
  isGeneratingAccounts: boolean
  isCalculatingValues: boolean
  calculatedValues: CalculateToMigrateToNeo3ValuesResponse
}

type TLocationState = {
  account: IAccountState
  neo3Account?: Account<'neo3'>
  neo3WalletInfo?: THardwareWalletInfo
}

export const MigrationNeo3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'migrationNeo3' })
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })
  const navigate = useNavigate()
  const { doesAccountExist } = useAccountUtils()
  const { currentLoginSessionRef } = useCurrentLoginSessionSelector()
  const { importAccount } = useBlockchainActions()
  const { accountsRef } = useAccountsSelector()
  const dispatch = useAppDispatch()
  const { isConnectedAndUnlockedHardwareWallet } = useHardwareWalletActions()
  const { createHardwareWallet } = useHardwareWalletActions()

  const {
    state: { account, neo3WalletInfo, ...params },
  } = useLocation() as Location<TLocationState>

  const { wallet } = useWalletByIdSelector(account.idWallet)
  const balanceQuery = useBalance(account)
  const migrationNeo3Validations = useMigrationNeo3Validations({ account })

  const service = bsAggregator.blockchainServicesByName[account.blockchain]

  const isHardwareAccount = account.type === 'hardware' && hasLedger(service)

  const neo3Service = bsAggregator.blockchainServicesByName.neo3
  const neo3GasToken = neo3Service.tokens.find(({ symbol }) => symbol === 'GAS')!
  const neo3NeoToken = neo3Service.tokens.find(({ symbol }) => symbol === 'NEO')!

  const tokenBalances = balanceQuery.data?.tokensBalances ?? []

  const {
    actionData: { serviceAccount, neo3Account, isGeneratingAccounts, isCalculatingValues, calculatedValues },
    actionState,
    setData,
    handleAct,
  } = useActions<TActionsData>({
    serviceAccount: null,
    neo3Account: params.neo3Account ?? null,
    isGeneratingAccounts: true,
    isCalculatingValues: false,
    calculatedValues: {},
  })

  const gasTokenBalance = tokenBalances.find(({ token }) => token.symbol === 'GAS')
  const neoTokenBalance = tokenBalances.find(({ token }) => token.symbol === 'NEO')

  const hasGasAmount = migrationNeo3Validations.hasGasAmount(gasTokenBalance?.amountNumber ?? 0)
  const hasNeoAmount = migrationNeo3Validations.hasNeoAmount(neoTokenBalance?.amountNumber ?? 0)

  const tokensText = match({ hasGasAmount, hasNeoAmount })
    .with({ hasGasAmount: true, hasNeoAmount: true }, () => `${neo3NeoToken.symbol} & ${neo3GasToken.symbol}`)
    .with({ hasNeoAmount: true }, () => neo3NeoToken.symbol)
    .with({ hasGasAmount: true }, () => neo3GasToken.symbol)
    .otherwise(() => t('labels.notFound'))

  const handleGoBack = () => {
    navigate(`/app/wallets/${account.id}/overview`)
  }

  const handleCalculateToMigrateToNeo3Values = async () => {
    if (isCalculatingValues || actionState.isActing || !serviceAccount || !neo3Account || !hasMigrationNeo3(service))
      return

    setData({ isCalculatingValues: true })

    try {
      const calculatedValues = await service.calculateToMigrateToNeo3Values({ account: serviceAccount })

      setData({ calculatedValues })
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t('messages.calculateValuesError') })
    } finally {
      setData({ isCalculatingValues: false })
    }
  }

  const handleGenerateAccounts = async () => {
    if (!isGeneratingAccounts) return

    setData({ isGeneratingAccounts: true })

    let key = ''

    try {
      key = await window.api.sendAsync('decryptBasedEncryptedSecret', {
        value: account.encryptedKey!,
        encryptedSecret: currentLoginSessionRef.current!.encryptedPassword,
      })
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t('messages.getKeyError') })

      handleGoBack()

      return
    }

    let serviceAccount: Account<TBlockchainServiceKey>

    try {
      serviceAccount = AccountHelper.getServiceAccount({ account, key })

      setData({ serviceAccount })
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t('messages.generateAccountError') })

      handleGoBack()

      return
    }

    if (!isHardwareAccount) {
      let neo3Account: Account<'neo3'>

      try {
        neo3Account = neo3Service.generateAccountFromKey(key) as Account<'neo3'>

        setData({ neo3Account })
      } catch (error) {
        console.error(error)

        ToastHelper.error({ message: t('messages.generateNeo3AccountError') })

        handleGoBack()

        return
      }
    }

    setData({ isGeneratingAccounts: false })
  }

  const handleMigrateToNeo3 = async () => {
    if (actionState.isActing || !serviceAccount || !neo3Account || !hasMigrationNeo3(service)) return

    if (isHardwareAccount) {
      const isConnectedAndUnlocked = await isConnectedAndUnlockedHardwareWallet(account)

      if (!isConnectedAndUnlocked) {
        const message = t('messages.hardwareWalletNotConnectedOrLocked')

        ToastHelper.error({ message, duration: 8000 })

        throw new Error(message)
      }
    }

    try {
      const transactionHash = await service.migrateToNeo3({ account: serviceAccount, address: neo3Account.address })

      const doesNeo3AccountExist = doesAccountExist({
        address: neo3Account.address,
        blockchain: neo3Account.blockchain,
      })

      if (isHardwareAccount && neo3WalletInfo) await createHardwareWallet([neo3WalletInfo], { accountsType: 'watch' })
      else if (!doesNeo3AccountExist)
        await importAccount({
          address: neo3Account.address,
          blockchain: neo3Account.blockchain,
          key: neo3Account.key,
          type: 'standard',
          wallet: wallet!,
        })

      const tokenBalanceTransfers: TTokenBalance[] = []

      if (hasGasAmount && gasTokenBalance) tokenBalanceTransfers.push(gasTokenBalance)
      if (hasNeoAmount && neoTokenBalance) tokenBalanceTransfers.push(neoTokenBalance)

      // TODO: It is an workaround to avoid check two times the same transaction as migration happens in only one transaction
      // Fix here: https://app.clickup.com/t/86a791t0c
      const transactionsTransfer = tokenBalanceTransfers.map<TUseTransactionsTransfer>(tokenBalance => ({
        account,
        amount: tokenBalance.amount,
        asset: tokenBalance.token.symbol,
        to: BSNeoLegacyConstants.MIGRATION_NEO3_COZ_ADDRESS,
        from: account.address,
        hash: transactionHash,
        time: DateHelper.getNowUnix(),
        fromAccount: account,
        isPending: true,
        toAccount: accountsRef.current.find(
          ({ address }) => address === BSNeoLegacyConstants.MIGRATION_NEO3_COZ_ADDRESS
        ),
      }))

      dispatch(
        thunks.waitMigration({
          hash: transactionHash,
          transactionsTransfer,
          neo3Address: neo3Account.address,
        })
      )

      navigate(`/app/wallets/${account.id}/transactions`)

      ToastHelper.success({ message: t('messages.migrationSuccess') })
    } catch (error) {
      console.error(error)

      ToastHelper.error({ message: t('messages.migrationError') })
    }
  }

  useEffect(() => {
    if (
      account.blockchain !== 'neoLegacy' ||
      (!balanceQuery.isLoading && !migrationNeo3Validations.canMigrateToNeo3({ tokenBalances }))
    )
      handleGoBack()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceQuery.isLoading, tokenBalances])

  useEffect(() => {
    if (!serviceAccount || !neo3Account) return

    handleCalculateToMigrateToNeo3Values()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceAccount, neo3Account])

  useMountUnsafe(() => {
    handleGenerateAccounts()
  })

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

          {isGeneratingAccounts || isCalculatingValues ? (
            <Loader className="w-12 h-12 text-neon mt-6" />
          ) : (
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
                    <MigrationNeo3AssetText text={tokensText} blockchain={account.blockchain} />
                  </ActionStep>

                  <Separator />

                  <ActionStep
                    title={t('labels.receive')}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <MigrationNeo3AssetText text={tokensText} blockchain="neo3" />
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
                    title={tBlockchain(account.blockchain)}
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <p className="text-gray-100 text-sm pr-2">{account.address}</p>
                  </ActionStep>

                  <Separator />

                  <ActionStep
                    title={tBlockchain('neo3')}
                    className="mb-4"
                    headerClassName="gap-4"
                    leftIcon={<VscCircleFilled aria-hidden={true} className="text-gray-100 w-2 h-2" />}
                  >
                    <div className="flex items-center py-2 px-4 rounded bg-asphalt gap-x-2">
                      {!neo3Account ? (
                        <p className="text-pink text-sm min-w-56 text-center">{t('labels.notFoundNeo3Account')}</p>
                      ) : (
                        <>
                          <p className="text-gray-100 text-sm">{neo3Account.address}</p>

                          <IconButton
                            icon={<MdContentCopy aria-hidden={true} className="text-neon" />}
                            className="-mr-1"
                            compacted
                            onClick={UtilsHelper.copyToClipboard.bind(null, neo3Account.address)}
                          />
                        </>
                      )}
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
                    {!calculatedValues.neoMigrationAmount && !calculatedValues.gasMigrationAmount ? (
                      <p className="text-gray-100 text-right py-5 text-sm pr-2">{t('labels.notFound')}</p>
                    ) : (
                      <ul className="flex flex-col pr-2 py-5 text-sm gap-y-2 self-center">
                        <MigrationNeo3ListItemAmount
                          amount={calculatedValues.neoMigrationAmount}
                          symbol={neo3NeoToken.symbol}
                        />

                        <MigrationNeo3ListItemAmount
                          amount={calculatedValues.gasMigrationAmount}
                          symbol={neo3GasToken.symbol}
                        />
                      </ul>
                    )}
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
                      {!calculatedValues.neoMigrationTotalFees && !calculatedValues.gasMigrationTotalFees ? (
                        <p className="text-gray-100 text-right">{t('labels.notFound')}</p>
                      ) : (
                        <ul className="flex flex-col py-5 gap-y-2">
                          {calculatedValues.neoMigrationTotalFees && (
                            <MigrationNeo3ListItemFee
                              fee={calculatedValues.neoMigrationTotalFees}
                              hasAmount={hasNeoAmount}
                              neo3Token={neo3NeoToken}
                            />
                          )}

                          {calculatedValues.gasMigrationTotalFees && (
                            <MigrationNeo3ListItemFee
                              fee={calculatedValues.gasMigrationTotalFees}
                              hasAmount={hasGasAmount}
                              neo3Token={neo3GasToken}
                            />
                          )}
                        </ul>
                      )}
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
          )}
        </div>
      </section>
    </ContentLayout>
  )
}
