import { useTranslation } from 'react-i18next'
import { TbDiamondOff, TbFileImport, TbPlug } from 'react-icons/tb'
import { WalletConnectHelper } from '@renderer/helpers/WalletConnectHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { IAccountState } from '@shared/@types/store'

import { BlockchainIcon } from './BlockchainIcon'
import { Button } from './Button'

type TProps = {
  account?: IAccountState
}

export const EmptyState = ({ account }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionsTableEmpty' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <section className="flex min-h-0 w-full flex-grow justify-center overflow-auto">
      <div className="flex max-w-[21rem] flex-col items-center justify-center">
        <div className="my-5 flex items-center justify-center">
          <BlockchainIcon className="h-8 w-8 opacity-50" blockchain="neoLegacy" type="blue" />
          <div className="mx-5 h-2 w-2 rounded-full bg-blue opacity-50"></div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-asphalt">
            <TbDiamondOff aria-hidden={true} className="h-16 w-16 text-blue" />
          </div>
          <div className="mx-5 h-2 w-2 rounded-full bg-blue opacity-50"></div>
          <BlockchainIcon className="h-8 w-8 opacity-50" blockchain="ethereum" type="blue" />
        </div>
        <div className="flex justify-center text-center text-lg font-normal text-white">{t('title')}</div>
        <div className="mt-2 flex justify-center text-center text-xs text-gray-300">{t('subtitle')}</div>
        <div className="my-5 flex gap-3">
          {account && account.type !== 'watch' && !!WalletConnectHelper.supportedBlockchains[account.blockchain] && (
            <Button
              className="w-full"
              label={t('connectDappLabel')}
              rightIcon={<TbPlug />}
              onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
              clickableProps={{ className: 'h-10 text-sm' }}
            />
          )}
          <Button
            className="w-full"
            label={t('importAccountLabel')}
            rightIcon={<TbFileImport />}
            onClick={modalNavigateWrapper('import')}
            clickableProps={{ className: 'h-10 text-sm' }}
          />
        </div>
      </div>
    </section>
  )
}
