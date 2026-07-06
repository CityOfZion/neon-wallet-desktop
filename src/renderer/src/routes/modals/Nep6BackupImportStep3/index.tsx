import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Separator } from '@renderer/components/Separator'

import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { ImportModalLayout } from '@renderer/layouts/ImportModalLayout'

import type { TUseImportNep6Account } from '@shared/types/hooks'
import type { TModalState } from '@shared/types/modal'

const Nep6BackupImportStep3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'nep6BackupImport' })
  const { content, onDecrypt } = useModalState<TModalState<'nep6-backup-import-step-3'>>()
  const { modalNavigateWrapper } = useModalNavigate()
  const { doesAccountExist } = useAccountUtils()

  const [accounts, setAccounts] = useState<TUseImportNep6Account[]>([])

  const selectableAccounts = content.accounts.filter(account => !doesAccountExist(account))

  const handleToggleAccount = (account: TUseImportNep6Account) => {
    setAccounts(previousAccounts => {
      const index = previousAccounts.findIndex(currentAccount => currentAccount.address === account.address)

      if (index === -1) {
        return [...previousAccounts, account]
      }

      return previousAccounts.filter(currentAccount => currentAccount.address !== account.address)
    })
  }

  const handleSelectAllAccounts = () => {
    setAccounts(selectableAccounts)
  }

  const isDisabled = selectableAccounts.length === 0

  return (
    <ImportModalLayout heading={t('title')} size="md">
      <p className="text-white">{t('step3.selectTitle')}</p>

      <div className="mt-8 flex justify-between">
        <span className="text-gray-100 uppercase">{t('step3.selectLabel')}</span>

        <Button
          label={t('step3.selectAllButtonLabel')}
          variant="text-slim"
          flat
          onClick={handleSelectAllAccounts}
          disabled={isDisabled}
        />
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
                      {isAccountExist && (
                        <span className="text-green text-sm italic">{t('step3.alreadyImportedLabel')}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-300">{account.address}</span>
                  </div>
                </div>

                <Checkbox
                  onClick={handleToggleAccount.bind(null, account)}
                  checked={isAccountExist || accounts.some(selectWallet => selectWallet.address === account.address)}
                  disabled={isAccountExist}
                />
              </div>

              {index < content.accounts.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </div>

      <span className="text-blue my-3.5 text-center">
        {t('step3.selectedQuantity', { selected: accounts.length, count: content.accounts.length })}
      </span>

      <Button
        label={t('step3.buttonLabel')}
        flat
        className="px-16"
        disabled={accounts.length <= 0}
        onClick={modalNavigateWrapper('nep6-backup-import-step-4', {
          state: { accounts, onDecrypt },
        })}
      />
    </ImportModalLayout>
  )
}

export default Nep6BackupImportStep3Modal
