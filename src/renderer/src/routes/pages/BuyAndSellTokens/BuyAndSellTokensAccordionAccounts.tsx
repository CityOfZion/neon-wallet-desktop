import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Accordion } from '@renderer/components/Accordion'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { IAccountState } from '@shared/@types/store'
import { motion, useAnimate } from 'framer-motion'

import { BuyAndSellTokensAccordionWalletItem } from './BuyAndSellTokensAccordionWalletItem'

type TProps = {
  isOpened: boolean
  account?: IAccountState
}

export const BuyAndSellTokensAccordionAccounts = ({ isOpened, account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens.buyAndSellTokensAccordionAccounts' })
  const [scope, animate] = useAnimate()
  const { wallets: currentWallets } = useWalletsSelector()

  const wallets = account ? currentWallets.filter(({ id }) => id === account.idWallet) : currentWallets
  const [firstWallet] = wallets

  useLayoutEffect(() => {
    animate(
      scope.current,
      {
        width: isOpened ? 364 : 0,
        opacity: isOpened ? 1 : 0,
        pointerEvents: isOpened ? 'auto' : 'none',
        overflowY: 'hidden',
      },
      { type: 'spring', duration: 0.4 }
    )

    setTimeout(() => {
      animate(scope.current, { overflowY: 'auto' }, { type: 'spring', duration: 0 })
    }, 200)
  }, [animate, scope, isOpened])

  return (
    <motion.div
      id="buy-and-sell-tokens-accordion-accounts"
      aria-hidden={!isOpened}
      ref={scope}
      className="bg-gray-900 w-full h-full p-4 border-l border-gray-300/15 -mr-4 overflow-y-auto absolute right-0 shadow-[-5px_0px_35px_0px_rgba(26,32,38,0.4)]"
    >
      <h3 className="text-xs uppercase text-gray-300">{t('title')}</h3>

      <Accordion.Root
        className="flex flex-col gap-3 mt-3"
        type="multiple"
        defaultValue={firstWallet ? [firstWallet.id] : []}
      >
        {wallets.map(wallet => (
          <BuyAndSellTokensAccordionWalletItem key={wallet.id} wallet={wallet} />
        ))}
      </Accordion.Root>
    </motion.div>
  )
}
