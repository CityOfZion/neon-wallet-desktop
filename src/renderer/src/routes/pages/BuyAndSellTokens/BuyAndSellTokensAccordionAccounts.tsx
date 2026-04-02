import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { Accordion } from '@renderer/components/Accordion'

import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'

import { TAccount } from '@shared/types/store'

import { BuyAndSellTokensAccordionWalletItem } from './BuyAndSellTokensAccordionWalletItem'

type TProps = {
  isOpened: boolean
  account?: TAccount
}

export const BuyAndSellTokensAccordionAccounts = ({ isOpened, account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'buyAndSellTokens' })
  const { wallets: currentWallets } = useWalletsSelector()

  const wallets = account ? currentWallets.filter(({ id }) => id === account.idWallet) : currentWallets
  const [firstWallet] = wallets

  return (
    <motion.div
      id="buy-and-sell-tokens-accordion-accounts"
      aria-hidden={!isOpened}
      initial={{ width: 0, opacity: 0 }}
      animate={isOpened ? { width: 364, opacity: 1 } : { width: 0, opacity: 0 }}
      transition={{ type: 'spring', duration: 0.4 }}
      className="absolute right-0 z-10 -mr-4 h-full overflow-y-auto border-l border-gray-300/15 bg-gray-900 p-4 shadow-[-5px_0px_35px_0px_#1A202666]"
    >
      <h3 className="text-xs text-gray-300 uppercase">{t('walletsAndAccountsContentTitle')}</h3>

      <Accordion.Root
        className="mt-3 flex flex-col gap-3"
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
