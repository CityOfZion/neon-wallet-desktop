import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Separator } from '@renderer/components/Separator'

import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { MigrateAccountsModalLayout } from '@renderer/layouts/MigrateAccountsModalLayout'

import MdLooks3 from '@renderer/assets/images/md-looks-3.svg?react'

import type { TUseNeonMigrateAccountsSchema } from '@shared/types/hooks'
import type { TModalState } from '@shared/types/modal'

const MigrateAccountsStep3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'migrateWallets.step3' })
  const { content, onDecrypt } = useModalState<TModalState<'migrate-accounts-step-3'>>()
  const { modalNavigateWrapper } = useModalNavigate()
  const { doesAccountExist } = useAccountUtils()

  const [selectedAccountsToMigrate, setSelectedAccountsToMigrate] = useState<TUseNeonMigrateAccountsSchema[]>([])

  const handleSelect = (wallet: TUseNeonMigrateAccountsSchema) => {
    setSelectedAccountsToMigrate(prev => {
      const index = prev.findIndex(prevWallet => prevWallet.address === wallet.address)

      if (index === -1) {
        return [...prev, wallet]
      }

      return prev.filter(prevWallet => prevWallet.address !== wallet.address)
    })
  }

  const handleSelectAll = () => {
    const filteredContent = content.accounts.filter(account => {
      return !doesAccountExist(account)
    })

    setSelectedAccountsToMigrate(filteredContent)
  }

  return (
    <MigrateAccountsModalLayout currentStep={3} stepIcon={<MdLooks3 />} stepTitle={t('title')} withBackButton>
      <p className="text-white">{t('selectTitle')}</p>

      <div className="mt-8 flex justify-between">
        <span className="text-gray-100 uppercase">{t('selectLabel')}</span>

        <Button label={t('selectAllButtonLabel')} variant="text-slim" flat onClick={handleSelectAll} />
      </div>

      <div className="mt-1 flex min-h-0 w-full grow flex-col overflow-y-auto pr-2">
        {content.accounts.map((account, index) => {
          const isAccountExist = doesAccountExist(account)

          return (
            <Fragment key={account.address}>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center">
                  <BlockchainIcon className="mr-2 text-gray-100" blockchain={account.blockchain} />

                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <span className="text-sm text-white">{account.label}</span>
                      {isAccountExist && <span className="text-green text-sm italic">{t('alreadyImportedLabel')}</span>}
                    </div>
                    <span className="text-xs text-gray-300">{account.address}</span>
                  </div>
                </div>

                <Checkbox
                  onClick={handleSelect.bind(null, account)}
                  checked={
                    isAccountExist ||
                    selectedAccountsToMigrate.some(selectWallet => selectWallet.address === account.address)
                  }
                  disabled={isAccountExist}
                />
              </div>

              {index < content.accounts.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </div>

      <span className="text-blue my-3.5 text-center">
        {t('selectedQuantity', { selected: selectedAccountsToMigrate.length, total: content.accounts.length })}
      </span>

      <Button
        label={t('buttonLabel')}
        flat
        className="px-16"
        disabled={selectedAccountsToMigrate.length <= 0}
        onClick={modalNavigateWrapper('migrate-accounts-step-4', {
          state: { selectedAccountsToMigrate, content, onDecrypt },
        })}
      />
    </MigrateAccountsModalLayout>
  )
}

export default MigrateAccountsStep3Modal
