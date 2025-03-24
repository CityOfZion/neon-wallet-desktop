import { useTranslation } from 'react-i18next'
import { MdAdd } from 'react-icons/md'
import { Account } from '@cityofzion/blockchain-service'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { THardwareWalletInfo } from '@shared/@types/ipc'

type TProps = {
  account: Account | null
  walletInfo: THardwareWalletInfo
  isAddingAccount: boolean
  onAddAccount(): void
  onSelectAccount(address: string): void
}

export const PrepareHardwareWalletAccounts = ({
  account,
  walletInfo,
  isAddingAccount,
  onAddAccount,
  onSelectAccount,
}: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'prepareHardwareWalletMigrationNeo3' })

  return (
    <div className="flex flex-col items-center mx-auto gap-y-4">
      {walletInfo.accounts.length > 0 && (
        <div className="flex flex-col flex-grow min-h-0 gap-y-2">
          <h3 className="text-gray-100 uppercase text-xs">{t('labels.neo3Addresses')}</h3>

          <RadioGroup.Group
            value={account?.address}
            onValueChange={onSelectAccount}
            className="flex flex-col max-h-[200px] overflow-y-auto min-w-[400px] w-full rounded-md"
          >
            {walletInfo.accounts.map(({ address }) => (
              <RadioGroup.Item
                key={address}
                value={address}
                className="min-h-10 h-10 bg-asphalt"
                separatorClassName="px-0"
              >
                <label className="text-white text-sm">{address}</label>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
            ))}
          </RadioGroup.Group>
        </div>
      )}

      <Button
        label={t('buttons.addAccount')}
        className="w-44"
        textClassName="text-neon"
        flat
        variant="card"
        loading={isAddingAccount}
        iconsOnEdge={false}
        leftIcon={<MdAdd aria-hidden={true} className="text-neon" />}
        onClick={onAddAccount}
      />
    </div>
  )
}
