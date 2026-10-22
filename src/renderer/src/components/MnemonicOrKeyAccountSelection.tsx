import { Fragment, useState } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useMount } from '@renderer/hooks/useMount'
import { useLastIndexesByWallet } from '@renderer/hooks/useUtilitySelector'

import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'
import { TBlockchainServiceKey } from '@shared/types/blockchain'

import { Accordion } from './Accordion'
import { BlockchainIcon } from './BlockchainIcon'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Loader } from './Loader'
import { Separator } from './Separator'
import { Tooltip } from './Tooltip'

export type TMnemonicOrKeyAccountWithBlockchain = {
  address: string
  key: string
  derivationPath?: string
  order?: number
  blockchain: TBlockchainServiceKey
}

export type TMnemonicOrKeyAccount = {
  address: string
  key: string
  derivationPath?: string
  order?: number
}

type TMnemonicAccounts = [TBlockchainServiceKey, TMnemonicOrKeyAccount[]][]

type TProps = {
  mnemonicOrKey: string
  selectedAccounts: TMnemonicOrKeyAccountWithBlockchain[]
  onMount?: (accounts: TMnemonicOrKeyAccountWithBlockchain[]) => void
  onSelect: (accounts: TMnemonicOrKeyAccountWithBlockchain[]) => void
  className?: string
  onVerifyAccountExistence?: (account: TMnemonicOrKeyAccountWithBlockchain) => boolean
}

type TMnemonicOrKeyAccountSelectionAccordionProps = {
  mnemonicAccounts: TMnemonicAccounts
  selectedAccounts: TMnemonicOrKeyAccountWithBlockchain[]
  onVerifyAccountExistence?: (account: TMnemonicOrKeyAccountWithBlockchain) => boolean
  onSelect: (accounts: TMnemonicOrKeyAccountWithBlockchain[]) => void
}

const MnemonicOrKeyAccountSelectionAccordion = ({
  mnemonicAccounts,
  selectedAccounts,
  onVerifyAccountExistence,
  onSelect,
}: TMnemonicOrKeyAccountSelectionAccordionProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'mnemonicOrKeyAccountSelection' })
  const { t: tCommon } = useTranslation('common')

  const handleChecked = (checked: boolean, account: TMnemonicOrKeyAccountWithBlockchain) => {
    onSelect(
      checked ? [...selectedAccounts, account] : selectedAccounts.filter(SharedAccountHelper.predicateNot(account))
    )
  }

  return (
    <Accordion.Root className="flex flex-col gap-2.5" type="multiple">
      {mnemonicAccounts.map(([blockchain, accounts]) => (
        <Accordion.Item key={blockchain} value={blockchain} className="bg-asphalt rounded-sm">
          <Accordion.Trigger className="border-none">
            <div className="flex grow items-center justify-between">
              <div className="flex items-center gap-x-2.5 px-2 text-sm text-white">
                <BlockchainIcon blockchain={blockchain} className="text-white" />
                {tCommon(`blockchain.${blockchain}`)}
              </div>

              <span className="text-1xs mr-2 text-right text-gray-300 uppercase">
                {t('accountsLength', { length: accounts.length })}
              </span>
            </div>
          </Accordion.Trigger>

          <Accordion.Content asChild>
            <div className="px-4">
              <Separator />
            </div>
            <ul className="flex flex-col gap-2.5 px-4 py-2.5">
              {accounts.map(account => {
                const isDisabled = onVerifyAccountExistence?.({ ...account, blockchain }) || false
                const checkboxId = `mnemonic-or-key-account-${blockchain}-${account.address}`

                return (
                  <li
                    key={`${account.address}-${blockchain}`}
                    className="flex w-full items-center justify-between gap-x-2 text-xs text-white"
                  >
                    <label
                      htmlFor={checkboxId}
                      className={StyleHelper.mergeStyles('flex min-w-0 grow cursor-pointer flex-col gap-y-0.5', {
                        'cursor-not-allowed': isDisabled,
                      })}
                    >
                      {account.derivationPath && <span className="text-gray-300">{account.derivationPath}</span>}

                      <Tooltip title={account.address} contentProps={{ className: 'max-w-xs break-all' }}>
                        <span className={StyleHelper.mergeStyles('block truncate', { 'text-gray-300': isDisabled })}>
                          {account.address}
                        </span>
                      </Tooltip>
                    </label>

                    <Tooltip title={isDisabled ? t('alreadyExists') : ''}>
                      <Checkbox
                        id={checkboxId}
                        checked={selectedAccounts.some(
                          SharedAccountHelper.predicate({ address: account.address, blockchain })
                        )}
                        onCheckedChange={checked => handleChecked(checked, { ...account, blockchain })}
                        disabled={isDisabled}
                      />
                    </Tooltip>
                  </li>
                )
              })}
            </ul>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}

export const MnemonicOrKeyAccountSelection = ({
  mnemonicOrKey,
  className,
  selectedAccounts,
  onVerifyAccountExistence,
  onSelect,
  onMount,
}: TProps) => {
  const { t } = useTranslation('components', { keyPrefix: 'mnemonicOrKeyAccountSelection' })
  const [mnemonicAccounts, setMnemonicAccounts] = useState<TMnemonicAccounts>([])
  const [selectableAccounts, setSelectableAccounts] = useState<TMnemonicOrKeyAccountWithBlockchain[]>([])
  const { lastIndexesByWallet } = useLastIndexesByWallet()

  const areAllAccountsSelected =
    selectableAccounts.length > 0 &&
    selectableAccounts.every(account => selectedAccounts.some(SharedAccountHelper.predicate(account)))

  const handleToggleAll = () => {
    onSelect(areAllAccountsSelected ? [] : selectableAccounts)
  }

  const { isMounting } = useMount(async () => {
    const accountsToSelect: TMnemonicOrKeyAccountWithBlockchain[] = []
    let mnemonicAccountsArray: TMnemonicAccounts = []

    if (BSKeychainHelper.isValidMnemonic(mnemonicOrKey)) {
      const accountFromMnemonicMap = await BlockchainServiceHelper.bsAggregator.generateAccountsFromMnemonic(
        mnemonicOrKey,
        lastIndexesByWallet
      )

      mnemonicAccountsArray = Array.from(accountFromMnemonicMap.entries()).map(([blockchain, accounts]) => [
        blockchain,
        accounts.map((account, index) => ({ ...account, order: index })),
      ])
    } else {
      await UtilsHelper.promiseAll(
        Object.values(BlockchainServiceHelper.bsAggregator.blockchainServicesByName),
        async service => {
          const account = await service.generateAccountFromKey(mnemonicOrKey)
          mnemonicAccountsArray.push([service.name, [account]])
        }
      )
    }

    mnemonicAccountsArray.forEach(([blockchain, accounts]) => {
      accounts.forEach(account => {
        if (onVerifyAccountExistence && onVerifyAccountExistence({ ...account, blockchain })) return

        accountsToSelect.push({ ...account, blockchain })
      })
    })

    setMnemonicAccounts(mnemonicAccountsArray)
    setSelectableAccounts(accountsToSelect)
    onSelect([])
    onMount?.(accountsToSelect)
  }, [mnemonicOrKey])

  return (
    <div className={StyleHelper.mergeStyles('flex min-h-0 w-full flex-col gap-y-3 overflow-y-auto', className)}>
      {isMounting ? (
        <Loader className="text-white" />
      ) : mnemonicAccounts.length > 0 ? (
        <Fragment>
          <Button
            className="self-end"
            type="button"
            label={areAllAccountsSelected ? t('deselectAllButtonLabel') : t('selectAllButtonLabel')}
            variant="text-slim"
            flat
            onClick={handleToggleAll}
            disabled={selectableAccounts.length === 0}
            {...TestHelper.buildTestObject('mnemonic-or-key-account-selection-toggle-all')}
          />

          <MnemonicOrKeyAccountSelectionAccordion
            mnemonicAccounts={mnemonicAccounts}
            onSelect={onSelect}
            selectedAccounts={selectedAccounts}
            onVerifyAccountExistence={onVerifyAccountExistence}
          />
        </Fragment>
      ) : (
        <p className="w-full px-6 text-center text-xs text-gray-100">{t('noAccountsToImport')}</p>
      )}
    </div>
  )
}
