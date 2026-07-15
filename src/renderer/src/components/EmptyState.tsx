import { hasFaucet, hasWalletConnect } from '@cityofzion/blockchain-service'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { match } from 'ts-pattern'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useFaucetMutation } from '@renderer/hooks/useFaucet'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import TbDiamondOff from '@renderer/assets/images/tb-diamond-off.svg?react'
import TbDropletDollar from '@renderer/assets/images/tb-droplet-dollar.svg?react'
import TbPlug from '@renderer/assets/images/tb-plug.svg?react'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'

import { TAccount } from '@shared/types/store'

import { BlockchainIcon } from './BlockchainIcon'
import { Button } from './Button'

type TProps = {
  account?: TAccount
}

export const EmptyState = ({ account }: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'emptyState' })
  const { modalNavigateWrapper } = useModalNavigate()
  const navigate = useNavigate()
  const faucetMutation = useFaucetMutation()

  const service = account
    ? BlockchainServiceHelper.bsAggregator.blockchainServicesByNameRecord[account.blockchain]
    : undefined

  const hasAccountWalletConnect = !!account && !!service && hasWalletConnect(service)
  const hasAccountFaucet = !!account && !!service && hasFaucet(service)

  const handleFaucet = async () => {
    if (!account) return
    await faucetMutation.mutateAsync(account)
    navigate('/wallets/transactions', { state: { account } })
  }

  return (
    <section className="flex min-h-0 w-full grow justify-center overflow-auto">
      <div className="flex flex-col items-center justify-center">
        <div className="my-5 flex items-center justify-center">
          <BlockchainIcon className="text-blue size-8 opacity-50" blockchain={account?.blockchain || 'neo3'} />

          <div className="bg-blue mx-5 size-2 rounded-full opacity-50" />

          <div className="bg-asphalt flex h-24 w-24 items-center justify-center rounded-full">
            <TbDiamondOff aria-hidden className="text-blue h-16 w-16" />
          </div>

          <div className="bg-blue mx-5 size-2 rounded-full opacity-50" />

          <BlockchainIcon className="text-blue size-8 opacity-50" blockchain={account?.blockchain || 'ethereum'} />
        </div>

        <p className="flex justify-center text-center text-xl font-bold text-white">{t('title')}</p>

        {account?.type !== 'watch' && (
          <p className="mt-2 max-w-96 text-center text-base text-gray-100">
            {match({ account, hasAccountWalletConnect })
              .with({ account: { blockchain: 'stellar' } }, () => (
                <Trans t={t} i18nKey="stellarSubtitle">
                  start
                  <a
                    className="text-blue hover:text-blue/80 focus:text-blue/80 active:text-blue/70 block cursor-pointer"
                    href={ConstantsHelper.stellarCreateAccountDocumentationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    end
                  </a>
                </Trans>
              ))
              .with({ hasAccountWalletConnect: true }, () => t('subtitleNonWatch'))
              .otherwise(() => t('subtitleNonWatchWithoutDapp'))}
          </p>
        )}

        {account?.type !== 'watch' && (
          <div className="mt-6 flex gap-3">
            <Button
              className="w-full"
              label={t('receiveTokensButtonLabel')}
              colorSchema="white"
              leftIcon={<TbStepInto aria-hidden />}
              onClick={() => navigate('/receive', { state: { account } })}
              clickableProps={{ className: 'h-10 text-sm' }}
            />

            {hasAccountFaucet ? (
              <Button
                className="w-full min-w-26"
                label={t('faucetButtonLabel')}
                colorSchema="blue"
                leftIcon={<TbDropletDollar aria-hidden />}
                loading={faucetMutation.isPending}
                onClick={handleFaucet}
                clickableProps={{ className: 'h-10 text-sm' }}
              />
            ) : (
              hasAccountWalletConnect && (
                <Button
                  className="w-full"
                  label={t('connectDappButtonLabel')}
                  leftIcon={<TbPlug aria-hidden />}
                  onClick={modalNavigateWrapper('dapp-connection', { state: { account } })}
                  clickableProps={{ className: 'h-10 text-sm' }}
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  )
}
