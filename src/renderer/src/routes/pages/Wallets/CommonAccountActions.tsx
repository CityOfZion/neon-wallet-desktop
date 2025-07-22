import { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TbArrowsExchange from '@renderer/assets/images/tb-arrows-exchange.svg?react'
import TbCancel from '@renderer/assets/images/tb-cancel.svg?react'
import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import TbShoppingBag from '@renderer/assets/images/tb-shopping-bag.svg?react'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'
import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'
import { SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID } from '@renderer/constants/swap'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useBalance } from '@renderer/hooks/useBalances'
import { useMigrationNeo3Validations } from '@renderer/hooks/useMigrationNeo3Validations'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  account: IAccountState
} & ComponentProps<'div'>

export const CommonAccountActions = ({ account, children, className, ...props }: TProps) => {
  const navigate = useNavigate()
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { t } = useTranslation('common', { keyPrefix: 'general' })
  const { t: tWallets } = useTranslation('pages', { keyPrefix: 'wallets' })
  const balanceQuery = useBalance(account)
  const { canMigrateToNeo3 } = useMigrationNeo3Validations(account)

  const tokenBalances = balanceQuery.data?.tokensBalances ?? []

  const isDisabledMigrationNeo3 = balanceQuery.isLoading || !canMigrateToNeo3({ tokenBalances })

  const isSwapAvailable = !!SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID[account.blockchain][network.id]?.length

  const handleMigrate = async () => {
    navigate('/app/migration-neo3', { state: { neoLegacyAccount: account } })
  }

  if (account.type === 'watch') {
    return null
  }

  return (
    <div className={StyleHelper.mergeStyles('flex gap-2', className)} {...props}>
      {children}

      {account.blockchain === 'neoLegacy' && (
        <Tooltip
          title={isDisabledMigrationNeo3 ? tWallets('tooltips.migrateRules') : ''}
          variant="black"
          delayDuration={0}
          contentProps={{ className: 'text-center w-72 flex items-center justify-center' }}
          icon={<TbCancel aria-hidden className="h-6 min-h-6 w-6 min-w-6 text-pink" />}
        >
          <Button
            label={t('migrate')}
            className="h-9 w-fit"
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
        className="h-9 w-fit"
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
          className="h-9 w-fit"
          variant="text"
          flat
          colorSchema="neon"
          clickableProps={{ className: 'text-xs' }}
          onClick={() => navigate('/app/swap', { state: { account } })}
        />
      )}

      <Button
        leftIcon={<TbStepInto aria-hidden={true} />}
        label={t('receive')}
        className="h-9 w-fit"
        variant="text"
        colorSchema="neon"
        flat
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/receive', { state: { account } })}
      />

      <Button
        leftIcon={<TbStepOut aria-hidden={true} />}
        label={t('send')}
        className="h-9 w-fit"
        variant="text"
        flat
        colorSchema="neon"
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/send', { state: { account } })}
      />
    </div>
  )
}
