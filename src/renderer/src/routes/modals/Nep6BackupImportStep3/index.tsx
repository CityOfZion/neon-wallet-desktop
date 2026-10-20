import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useAccountUtils } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { ImportModalLayout } from '@renderer/layouts/ImportModalLayout'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
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
      if (!previousAccounts.some(SharedAccountHelper.predicate(account))) {
        return [...previousAccounts, account]
      }

      return previousAccounts.filter(SharedAccountHelper.predicateNot(account))
    })
  }

  const isDisabled = selectableAccounts.length === 0

  const areAllAccountsSelected =
    !isDisabled && selectableAccounts.every(account => accounts.some(SharedAccountHelper.predicate(account)))

  const handleToggleAllAccounts = () => {
    setAccounts(areAllAccountsSelected ? [] : selectableAccounts)
  }

  return (
    <ImportModalLayout heading={t('title')} size="md">
      <p className="text-white">{t('step3.selectTitle')}</p>

      <div className="mt-8 flex justify-between">
        <span className="text-gray-100 uppercase">{t('step3.selectLabel')}</span>

        <Button
          label={areAllAccountsSelected ? t('step3.deselectAllButtonLabel') : t('step3.selectAllButtonLabel')}
          variant="text-slim"
          flat
          onClick={handleToggleAllAccounts}
          disabled={isDisabled}
        />
      </div>

      <div className="mt-1 flex min-h-0 w-full grow flex-col overflow-y-auto pr-2">
        {content.accounts.map((account, index) => {
          const isAccountExist = doesAccountExist(account)
          const checkboxId = `nep6-backup-import-account-${SharedAccountHelper.buildAccountKey(account)}`

          return (
            <Fragment key={SharedAccountHelper.buildAccountKey(account)}>
              <div className="flex items-center justify-between gap-x-2 py-4">
                <label
                  htmlFor={checkboxId}
                  className={StyleHelper.mergeStyles('flex grow cursor-pointer items-center', {
                    'cursor-not-allowed': isAccountExist,
                  })}
                >
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
                </label>

                <Checkbox
                  id={checkboxId}
                  onClick={handleToggleAccount.bind(null, account)}
                  checked={accounts.some(SharedAccountHelper.predicate(account))}
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
