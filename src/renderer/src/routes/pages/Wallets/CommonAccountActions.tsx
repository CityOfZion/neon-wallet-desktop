import { ComponentProps, Fragment } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { SwapHelper } from '@renderer/helpers/SwapHelper'

import { useSelectedNetworkSelector } from '@renderer/hooks/useSettingsSelector'

import TbReplace from '@renderer/assets/images/tb-replace.svg?react'
import TbShoppingBag from '@renderer/assets/images/tb-shopping-bag.svg?react'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'
import TbStepOut from '@renderer/assets/images/tb-step-out.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  account: IAccountState
} & ComponentProps<'div'>

export const CommonAccountActions = ({ account, children, className, ...props }: TProps) => {
  const navigate = useNavigate()
  const { network } = useSelectedNetworkSelector(account.blockchain)
  const { t } = useTranslation('common', { keyPrefix: 'general' })

  const isSwapAvailable = !!SwapHelper.getNetwork(account.blockchain, network)

  const isWatchAccount = account.type === 'watch'

  if (isWatchAccount && !children) {
    return null
  }

  return (
    <div className={StyleHelper.mergeStyles('flex gap-2', className)} {...props}>
      {children}

      {!isWatchAccount && (
        <Fragment>
          <Button
            label={t('buyAndSellTokens')}
            className="h-9 w-fit"
            variant="text"
            colorSchema="neon"
            flat
            clickableProps={{ className: 'text-xs' }}
            leftIcon={<TbShoppingBag aria-hidden />}
            onClick={() => navigate('/buy-and-sell-tokens', { state: { account } })}
          />

          {isSwapAvailable && (
            <Button
              leftIcon={<TbReplace aria-hidden />}
              label={t('swap')}
              className="h-9 w-fit"
              variant="text"
              flat
              colorSchema="neon"
              clickableProps={{ className: 'text-xs' }}
              onClick={() => navigate('/swap', { state: { account } })}
            />
          )}

          <Button
            leftIcon={<TbStepInto aria-hidden />}
            label={t('receive')}
            className="h-9 w-fit"
            variant="text"
            colorSchema="neon"
            flat
            clickableProps={{ className: 'text-xs' }}
            onClick={() => navigate('/receive', { state: { account } })}
          />

          <Button
            leftIcon={<TbStepOut aria-hidden />}
            label={t('send')}
            className="h-9 w-fit"
            variant="text"
            flat
            colorSchema="neon"
            clickableProps={{ className: 'text-xs' }}
            onClick={() => navigate('/send', { state: { account } })}
          />
        </Fragment>
      )}
    </div>
  )
}
