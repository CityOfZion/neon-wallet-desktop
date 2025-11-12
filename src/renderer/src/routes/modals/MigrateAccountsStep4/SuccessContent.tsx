import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@renderer/components/Button'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import MdCheck from '@renderer/assets/images/md-check.svg?react'
import MdOutlineRemoveRedEye from '@renderer/assets/images/md-outline-remove-red-eye.svg?react'

import { IAccountState } from '@shared/types/store'

type TProps = {
  accounts: IAccountState[]
}

export const SuccessContent = ({ accounts }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step4.success' })
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleView = () => {
    modalNavigate(-1)
    navigate(`/wallets/${accounts[0].id}/overview`)
  }

  return (
    <div className="mt-7 flex min-h-0 w-full grow flex-col justify-between">
      <div className="flex min-h-0 w-full flex-col gap-1.5 overflow-auto">
        {accounts.map(account => (
          <div key={account.id} className="flex items-center rounded-sm bg-gray-300/15 px-5 py-2">
            <div className="flex min-w-0 grow flex-col gap-1">
              <span className="text-sm text-white">{account.name}</span>
              <span className="truncate text-xs text-gray-300">{account.address}</span>
            </div>

            <MdCheck aria-hidden className="text-green h-4.5 w-4.5" />
          </div>
        ))}
      </div>

      <Button
        label={t('buttonLabel')}
        iconsOnEdge={false}
        rightIcon={<MdOutlineRemoveRedEye aria-hidden />}
        className="mt-3 px-15"
        onClick={handleView}
      />
    </div>
  )
}
