import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbReplace, TbShoppingBag, TbStepInto, TbStepOut } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID } from '@renderer/constants/swap'
import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'
import { IAccountState } from '@shared/@types/store'

type TProps = {
  account: IAccountState
}

export const CommonAccountActions = ({ account }: TProps) => {
  const navigate = useNavigate()
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { t } = useTranslation('common', { keyPrefix: 'general' })

  const isSwapAvailable = !!SWAP_NETWORK_BY_BLOCKCHAIN_AND_NETWORK_ID[account.blockchain][network.id]?.length

  return account?.type !== 'watch' ? (
    <div className="flex gap-2">
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
