import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MnemonicHelper } from '@renderer/helpers/MnemonicHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useMount } from '@renderer/hooks/useMount'
import { useLastIndexesByWallet } from '@renderer/hooks/useUtilitySelector'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { SharedAccountHelper } from '@shared/helpers/SharedAccountHelper'

import { Accordion } from './Accordion'
import { BlockchainIcon } from './BlockchainIcon'
import { Checkbox } from './Checkbox'
import { Loader } from './Loader'
import { Separator } from './Separator'
import { Tooltip } from './Tooltip'

export type TMnemonicOrKeyAccountWithBlockchain = {
  address: string
  key: string
  derivationPath?: string
  blockchain: TBlockchainServiceKey
}

export type TMnemonicOrKeyAccount = {
  address: string
  key: string
  derivationPath?: string
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
  const { t: commonT } = useTranslation('common')

  const handleChecked = (checked: boolean, account: TMnemonicOrKeyAccountWithBlockchain) => {
    onSelect(
      checked ? [...selectedAccounts, account] : selectedAccounts.filter(SharedAccountHelper.predicateNot(account))
    )
  }

  return (
    <Accordion.Root className="flex flex-col gap-2.5" type="multiple">
      {mnemonicAccounts.map(([blockchain, accounts]) => (
        <Accordion.Item key={blockchain} value={blockchain} className="rounded bg-asphalt">
          <Accordion.Trigger className="border-none">
            <div className="flex flex-grow items-center justify-between">
              <div className="flex items-center gap-x-2.5 px-2 text-sm text-white">
                <BlockchainIcon blockchain={blockchain} type="white" />
                {commonT(`blockchain.${blockchain}`)}
              </div>

              <span className="mr-2 text-right text-1xs uppercase text-gray-300">
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
                const isDisabled = onVerifyAccountExistence?.({ ...account, blockchain }) ?? false

                return (
                  <li
                    key={`${account.address}-${blockchain}`}
                    className="flex w-full flex-col gap-y-0.5 text-xs text-white"
                  >
                    {account.derivationPath && <span className="text-gray-300">{account.derivationPath}</span>}

                    <div className="flex items-center justify-between gap-x-2">
                      <span
                        className={StyleHelper.mergeStyles('block min-w-0 truncate', { 'text-gray-300': isDisabled })}
                      >
                        {account.address}
                      </span>

                      <Tooltip title={isDisabled ? t('alreadyExists') : ''}>
                        <Checkbox
                          checked={selectedAccounts.some(
                            SharedAccountHelper.predicate({ address: account.address, blockchain })
                          )}
                          onCheckedChange={checked => handleChecked(checked, { ...account, blockchain })}
                          disabled={isDisabled}
                        />
                      </Tooltip>
                    </div>
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
  const { lastIndexesByWallet } = useLastIndexesByWallet()

  const { isMounting } = useMount(async () => {
    const selectedAccounts: TMnemonicOrKeyAccountWithBlockchain[] = []
    let mnemonicAccountsArray: TMnemonicAccounts = []

    if (MnemonicHelper.isValidMnemonic(mnemonicOrKey)) {
      const accountFromMnemonicMap = await bsAggregator.generateAccountsFromMnemonic(mnemonicOrKey, lastIndexesByWallet)

      mnemonicAccountsArray = Array.from(accountFromMnemonicMap.entries())
    } else {
      await UtilsHelper.promiseAll(Object.values(bsAggregator.blockchainServicesByName), async service => {
        const account = service.generateAccountFromKey(mnemonicOrKey)
        mnemonicAccountsArray.push([service.name, [account]])
      })
    }

    mnemonicAccountsArray.forEach(([blockchain, accounts]) => {
      accounts.forEach(account => {
        if (onVerifyAccountExistence && onVerifyAccountExistence({ ...account, blockchain })) return

        selectedAccounts.push({ ...account, blockchain })
      })
    })

    setMnemonicAccounts(mnemonicAccountsArray)
    onSelect(selectedAccounts)
    onMount?.(selectedAccounts)
  }, [mnemonicOrKey])

  return (
    <div className={StyleHelper.mergeStyles('flex min-h-0 w-full flex-col gap-y-2.5 overflow-y-auto', className)}>
      {isMounting ? (
        <Loader className="text-white" />
      ) : mnemonicAccounts.length > 0 ? (
        <MnemonicOrKeyAccountSelectionAccordion
          mnemonicAccounts={mnemonicAccounts}
          onSelect={onSelect}
          selectedAccounts={selectedAccounts}
          onVerifyAccountExistence={onVerifyAccountExistence}
        />
      ) : (
        <p className="w-full px-6 text-center text-xs text-gray-100">{t('noAccountsToImport')}</p>
      )}
    </div>
  )
}
