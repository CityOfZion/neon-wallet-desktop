import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountHelper } from '@renderer/helpers/AccountHelper'
import { MnemonicHelper } from '@renderer/helpers/MnemonicHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useMount } from '@renderer/hooks/useMount'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

import { Accordion } from './Accordion'
import { BlockchainIcon } from './BlockchainIcon'
import { Checkbox } from './Checkbox'
import { Loader } from './Loader'
import { Separator } from './Separator'

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
    onSelect(checked ? [...selectedAccounts, account] : selectedAccounts.filter(AccountHelper.predicateNot(account)))
  }

  return (
    <Accordion.Root className="flex flex-col gap-2.5" type="multiple">
      {mnemonicAccounts.map(([blockchain, accounts]) => (
        <Accordion.Item key={blockchain} value={blockchain} className="bg-asphalt rounded">
          <Accordion.Trigger className="border-none ">
            <div className="flex flex-grow justify-between items-center">
              <div className="flex px-2 gap-x-2.5 items-center text-sm text-white">
                <BlockchainIcon blockchain={blockchain} type="white" />
                {commonT(`blockchain.${blockchain}`)}
              </div>

              <span className="text-gray-300 text-xs mr-6 uppercase">
                {t('accountsLength', { length: accounts.length })}
              </span>
            </div>
          </Accordion.Trigger>

          <Accordion.Content asChild>
            <div className="px-4">
              <Separator />
            </div>
            <ul className="flex flex-col px-4 py-2.5 gap-2.5">
              {accounts.map(account => (
                <li
                  key={`${account.address}-${blockchain}`}
                  className="flex flex-col w-full gap-y-0.5 text-white text-xs"
                >
                  {account.derivationPath && <span className="text-gray-300">{account.derivationPath}</span>}

                  <div className="flex gap-x-2 justify-between items-center">
                    <span className="block truncate min-w-0">{account.address}</span>
                    <Checkbox
                      checked={selectedAccounts.some(AccountHelper.predicate({ address: account.address, blockchain }))}
                      onCheckedChange={checked => handleChecked(checked, { ...account, blockchain })}
                      disabled={onVerifyAccountExistence?.({ ...account, blockchain })}
                    />
                  </div>
                </li>
              ))}
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

  const { isMounting } = useMount(async () => {
    const selectedAccounts: TMnemonicOrKeyAccountWithBlockchain[] = []
    let mnemonicAccountsArray: TMnemonicAccounts = []

    if (MnemonicHelper.isValidMnemonic(mnemonicOrKey)) {
      const accountFromMnemonicMap = await bsAggregator.generateAccountsFromMnemonic(mnemonicOrKey)

      mnemonicAccountsArray = Array.from(accountFromMnemonicMap.entries())
    } else {
      await UtilsHelper.promiseAll(Object.values(bsAggregator.blockchainServicesByName), async service => {
        const account = service.generateAccountFromKey(mnemonicOrKey)
        mnemonicAccountsArray.push([service.blockchainName, [account]])
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
    <div className={StyleHelper.mergeStyles('flex flex-col gap-y-2.5 min-h-0 overflow-y-auto w-full ', className)}>
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
        <p className="w-full text-center text-xs text-gray-100">{t('noAccountsToImport')}</p>
      )}
    </div>
  )
}
