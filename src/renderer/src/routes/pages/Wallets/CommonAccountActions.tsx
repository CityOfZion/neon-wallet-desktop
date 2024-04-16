import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { TbStepInto, TbStepOut } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { isClaimable } from '@cityofzion/blockchain-service'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { bsAggregator } from '@renderer/libs/blockchainService'

import { ClaimGasButton } from './ClaimGasButton'

type TProps = {
  account: IAccountState
}

export const CommonAccountActions = ({ account }: TProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation('common', { keyPrefix: 'general' })

  const blockchainService = bsAggregator.blockchainServicesByName[account.blockchain]

  return account?.type !== 'watch' ? (
    <div className="flex gap-2">
      {isClaimable(blockchainService) && <ClaimGasButton blockchainService={blockchainService} account={account} />}

      <Button
        leftIcon={<TbStepInto className="text-neon w-5 h-5" />}
        label={t('receive')}
        className="w-fit h-9"
        variant="text"
        colorSchema="neon"
        flat
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/receive', { state: { account: account } })}
      />
      <Button
        leftIcon={<TbStepOut className="text-neon w-5 h-5" />}
        label={t('send')}
        className="w-fit h-9"
        variant="text"
        flat
        colorSchema="neon"
        clickableProps={{ className: 'text-xs' }}
        onClick={() => navigate('/app/send', { state: { account: account } })}
      />
    </div>
  ) : (
    <Fragment />
  )
}
