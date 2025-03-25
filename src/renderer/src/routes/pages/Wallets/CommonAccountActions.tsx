import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowsExchange, TbCancel, TbReplace, TbShoppingBag, TbStepInto, TbStepOut } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { hasLedger, isClaimable } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'
import { SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID } from '@renderer/constants/swap'
import { useBalance } from '@renderer/hooks/useBalances'
import { useMigrationNeo3Validations } from '@renderer/hooks/useMigrationNeo3Validations'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { useUnclaimed } from '@renderer/hooks/useUnclaimed'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  account: IAccountState
}

export const CommonAccountActions = ({ account }: TProps) => {
  const navigate = useNavigate()
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { t } = useTranslation('common', { keyPrefix: 'general' })
  const { t: tWallets } = useTranslation('pages', { keyPrefix: 'wallets' })
  const balanceQuery = useBalance(account)
  const unclaimedQuery = useUnclaimed(account)
  const { canMigrateToNeo3, shouldClaimBeforeMigrateToNeo3 } = useMigrationNeo3Validations({ account })
  const { modalNavigate } = useModalNavigate()

  const service = bsAggregator.blockchainServicesByName[account.blockchain]

  const tokenBalances = balanceQuery.data?.tokensBalances ?? []
  const unclaimedResult = unclaimedQuery.data

  const isShowedMigrationNeo3 = account.blockchain === 'neoLegacy'

  const isDisabledMigrationNeo3 =
    isShowedMigrationNeo3 &&
    (balanceQuery.isLoading || unclaimedQuery.isLoading || !canMigrateToNeo3({ tokenBalances }))

  const isSwapAvailable = !!SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID[account.blockchain][network.id]?.length

  const handleMigrate = async () => {
    if (!!unclaimedResult && shouldClaimBeforeMigrateToNeo3({ tokenBalances, unclaimedResult })) {
      modalNavigate('migration-neo3-claim-alert', { state: { account } })

      return
    }

    const isHardwareAccount = account.type === 'hardware' && hasLedger(service)

    if (isHardwareAccount) {
      modalNavigate('prepare-hardware-wallet-migration-neo3', { state: { account } })

      return
    }

    navigate('/app/migration-neo3', { state: { account } })
  }

  return account?.type !== 'watch' ? (
    <div className="flex gap-2">
      {isShowedMigrationNeo3 && (
        <Tooltip
          title={
            isDisabledMigrationNeo3
              ? tWallets('tooltips.migrateRules', {
                  claimTokenSymbol: (isClaimable(service) ? service.claimToken.symbol : '') || 'token',
                })
              : ''
          }
          contentProps={{ className: 'text-center w-72' }}
          icon={<TbCancel aria-hidden className="text-pink min-w-6 min-h-6 w-6 h-6" />}
        >
          <Button
            label={t('migrate')}
            className="w-fit h-9"
            variant="text"
            colorSchema="yellow"
            flat
            disabled={isDisabledMigrationNeo3}
            clickableProps={{ className: 'text-xs' }}
            leftIcon={<TbArrowsExchange aria-hidden={true} />}
            onClick={handleMigrate}
          />
        </Tooltip>
      )}

      <Button
        label={t('buyAndSellTokens')}
        className="w-fit h-9"
        variant="text"
        colorSchema="neon"
        flat
        clickableProps={{ className: 'text-xs' }}
        leftIcon={<TbShoppingBag aria-hidden={true} />}
        onClick={() => navigate('/app/buy-and-sell-tokens', { state: { account } })}
      />

      {isSwapAvailable && (
        <Button
          leftIcon={<TbReplace aria-hidden={true} />}
          label={t('swap')}
          className="w-fit h-9"
          variant="text"
          flat
          colorSchema="neon"
          clickableProps={{ className: 'text-xs' }}
          onClick={() => navigate('/app/swap', { state: { account } })}
        />
      )}

      <Button
        leftIcon={<TbStepInto />}
        label={t('receive')}
        className="w-fit h-9"
        variant="text"
        colorSchema="neon"
        flat
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/receive', { state: { account } })}
      />

      <Button
        leftIcon={<TbStepOut />}
        label={t('send')}
        className="w-fit h-9"
        variant="text"
        flat
        colorSchema="neon"
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/send', { state: { account } })}
      />
    </div>
  ) : (
    <Fragment />
  )
}
