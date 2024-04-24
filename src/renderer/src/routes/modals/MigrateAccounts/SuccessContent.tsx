import { useTranslation } from 'react-i18next'
import { MdCheck, MdOutlineRemoveRedEye } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  accounts: IAccountState[]
}

export const SuccessContent = ({ accounts }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step4.success' })
  const { modalNavigate } = useModalNavigate()
  const navigate = useNavigate()

  const handleView = () => {
    modalNavigate(-1)
    navigate(`/app/wallets/${accounts[0].address}/overview`)
  }

  return (
    <div className="flex flex-col flex-grow justify-between w-full mt-7 min-h-0">
      <div className="flex flex-col gap-1.5 w-full overflow-auto min-h-0">
        {accounts.map(account => (
          <div key={account.address} className="px-5 py-2 bg-gray-300/15 flex items-center rounded">
            <div className="flex flex-grow flex-col gap-1 min-w-0">
              <span className="text-sm text-white">{account.name}</span>
              <span className="text-xs text-gray-300 truncate">{account.address}</span>
            </div>

            <MdCheck className="w-4.5 h-4.5 text-green" />
          </div>
        ))}
      </div>

      <Button
        label={t('buttonLabel')}
        iconsOnEdge={false}
        rightIcon={<MdOutlineRemoveRedEye />}
        className="px-15 mt-3"
        onClick={handleView}
      />
    </div>
  )
}
