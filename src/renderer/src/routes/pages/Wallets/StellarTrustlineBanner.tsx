import { useMemo } from 'react'

import type { TBSStellarName } from '@cityofzion/bs-stellar'
import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Tooltip } from '@renderer/components/Tooltip'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { ConstantsHelper } from '@renderer/helpers/ConstantsHelper'

import { useIsTruncated } from '@renderer/hooks/useIsTruncated'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { useStellarTrustlinesQuery } from '@renderer/hooks/useStellarTruslines'

import TbShieldCheck from '@renderer/assets/images/tb-shield-check.svg?react'

import { TAccount } from '@shared/types/store'

type TProps = {
  account: TAccount<TBSStellarName>
}

export const StellarTrustlineBanner = ({ account }: TProps) => {
  const { t, i18n } = useTranslation('pages', { keyPrefix: 'wallets.stellarTrustlineBanner' })
  const { modalNavigateWrapper } = useModalNavigate()
  const {
    networkByBlockchain: { stellar: stellarNetwork },
  } = useSelectedNetworkByBlockchainSelector()

  const trustlinesQuery = useStellarTrustlinesQuery(account)

  const { ref: messageRef, isTruncated: isMessageTruncated } = useIsTruncated<HTMLSpanElement>()

  const missingTokens = useMemo(() => {
    const recommendedTokens = ConstantsHelper.stellarRecommendedTrustlineTokensByNetworkType[stellarNetwork.type]
    if (!recommendedTokens || !trustlinesQuery.data) return []

    const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName.stellar

    return recommendedTokens.filter(
      recommendedToken =>
        !trustlinesQuery.data.some(trustline => service.tokenService.predicateByHash(trustline.token, recommendedToken))
    )
  }, [stellarNetwork.type, trustlinesQuery.data])

  if (missingTokens.length === 0) return null

  const isWatchAccount = account.type === 'watch'
  const symbols = new Intl.ListFormat(i18n.language, { style: 'long', type: 'conjunction' }).format(
    missingTokens.map(token => token.symbol)
  )
  const message = t('message', { symbols, count: missingTokens.length })

  return (
    <div className="bg-asphalt mb-5 flex h-13.75 w-full items-center justify-between gap-x-4 rounded-sm px-4 text-sm">
      <div className="flex min-w-0 items-center gap-x-2">
        <BlockchainIcon className="text-yellow shrink-0" blockchain={account.blockchain} />

        <Tooltip
          title={message}
          open={isMessageTruncated ? undefined : false}
          variant="black"
          delayDuration={0}
          contentProps={{ className: 'max-w-64' }}
        >
          <span ref={messageRef} className="truncate text-gray-300">
            {message}
          </span>
        </Tooltip>
      </div>

      <div className="flex shrink-0 items-center gap-x-2">
        {missingTokens.map(token => (
          <Button
            key={token.hash}
            label={t('addButtonLabel', { symbol: token.symbol })}
            leftIcon={<TbShieldCheck aria-hidden />}
            flat
            disabled={isWatchAccount}
            onClick={modalNavigateWrapper('stellar-persist-trustlines', { state: { stellarAccount: account, token } })}
          />
        ))}
      </div>
    </div>
  )
}
