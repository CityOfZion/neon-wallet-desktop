import { ComponentProps } from 'react'

import { BuyAndSellTokensHelper } from '@renderer/helpers/BuyAndSellTokensHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useMountUnsafe } from '@renderer/hooks/useMount'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'

import type { IAccountState } from '@shared/types/store'

type TProps = { account?: IAccountState; onReady?: (ready: boolean) => void } & ComponentProps<'div'>

const IFRAME_CONTAINER_ID = 'buy-tokens-iframe-container'

export const BuyAndSellTokensBuyIframe = ({ account, onReady, className, ...props }: TProps) => {
  const { currency } = useCurrencySelector()

  useMountUnsafe(async () => {
    onReady?.(false)

    const destroySdkCallback = await BuyAndSellTokensHelper.initBuy({ account, currency, id: IFRAME_CONTAINER_ID })

    onReady?.(true)

    return destroySdkCallback
  })

  return (
    <div
      id={IFRAME_CONTAINER_ID}
      className={StyleHelper.mergeStyles(
        'h-full overflow-x-hidden overflow-y-auto rounded-lg border border-gray-300/15 [&>iframe]:w-[420px]! [&>iframe]:border-0!',
        className
      )}
      {...props}
    />
  )
}
