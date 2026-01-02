import { hasWalletConnect } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbDiamondOff from '@renderer/assets/images/tb-diamond-off.svg?react'
import TbFileImport from '@renderer/assets/images/tb-file-import.svg?react'
import TbPlug from '@renderer/assets/images/tb-plug.svg?react'

import { IAccountState } from '@shared/types/store'

import { BlockchainIcon } from './BlockchainIcon'
import { Button } from './Button'

type TProps = {
  account?: IAccountState
}

export const EmptyState = ({ account }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'transactionsTableEmpty' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <section className="flex min-h-0 w-full grow justify-center overflow-auto">
      <div className="flex max-w-84 flex-col items-center justify-center">
        <div className="my-5 flex items-center justify-center">
          <BlockchainIcon className="h-8 w-8 opacity-50" blockchain="neoLegacy" type="blue" />
          <div className="bg-blue mx-5 h-2 w-2 rounded-full opacity-50"></div>
          <div className="bg-asphalt flex h-24 w-24 items-center justify-center rounded-full">
            <TbDiamondOff aria-hidden className="text-blue h-16 w-16" />
          </div>
          <div className="bg-blue mx-5 h-2 w-2 rounded-full opacity-50"></div>
          <BlockchainIcon className="h-8 w-8 opacity-50" blockchain="ethereum" type="blue" />
        </div>
        <div className="flex justify-center text-center text-lg font-normal text-white">{t('title')}</div>
        <div className="mt-2 flex justify-center text-center text-xs text-gray-300">{t('subtitle')}</div>
        <div className="my-5 flex gap-3">
          {account &&
            account.type !== 'watch' &&
            hasWalletConnect(BlockchainServiceHelper.bsAggregator.blockchainServicesByName[account.blockchain]) && (
              <Button
                className="w-full"
                label={t('connectDappLabel')}
                rightIcon={<TbPlug aria-hidden />}
                onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
                clickableProps={{ className: 'h-10 text-sm' }}
              />
            )}
          <Button
            className="w-full"
            label={t('importAccountLabel')}
            rightIcon={<TbFileImport aria-hidden />}
            onClick={modalNavigateWrapper('import')}
            clickableProps={{ className: 'h-10 text-sm' }}
          />
        </div>
      </div>
    </section>
  )
}
