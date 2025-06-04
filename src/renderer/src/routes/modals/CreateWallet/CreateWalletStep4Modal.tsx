import { useTranslation } from 'react-i18next'
import { MdLooks4 } from 'react-icons/md'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Separator } from '@renderer/components/Separator'
import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'
import { blockchainNames } from '@renderer/libs/blockchainService'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'

type TLocationState = {
  words: string[]
  nameTrimmed: string
}

type TFormData = {
  blockchains: {
    name: TBlockchainServiceKey
    checked: boolean
  }[]
}

export const CreateWalletStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step4' })
  const { t: commonT } = useTranslation('common')
  const { nameTrimmed, words } = useModalState<TLocationState>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { createWallet, createStandardAccount } = useBlockchainActions()

  const { actionData, setData, handleAct } = useActions<TFormData>({
    blockchains: blockchainNames.map(name => {
      return { name, checked: true }
    }),
  })

  const isDisabled = actionData.blockchains.every(({ checked }) => !checked)

  const handleSubmit = async () => {
    const wallet = createWallet({
      name: nameTrimmed,
      mnemonic: words.join(' '),
    })

    const selectedBlockchains = actionData.blockchains.filter(service => service.checked)

    const accounts = await Promise.allSettled(
      selectedBlockchains.map(blockchain =>
        createStandardAccount({
          wallet,
          blockchain: blockchain.name,
          name: commonT('account.defaultName', { accountNumber: 1 }),
        })
      )
    )

    const createdAccounts = accounts.filter(result => result.status === 'fulfilled').map(result => result.value)

    modalNavigate('create-wallet-step-5', { state: { accounts: createdAccounts } })
  }

  const handleSelectedBlockchain = (position: number) => {
    setData({
      blockchains: actionData.blockchains.map((service, index) => {
        return index === position ? { ...service, checked: !service.checked } : { ...service }
      }),
    })
  }

  return (
    <CreateWalletModalLayout>
      <header className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-x-2.5">
          <MdLooks4 className="h-4.5 w-4.5 text-blue" aria-hidden={true} />
          <h2 className="text-sm">{t('title')}</h2>
        </div>
        <div className="text-sm text-blue">{t('step4of4')}</div>
      </header>
      <Separator className="mb-9 min-h-[0.0625rem]" />
      <form
        onSubmit={handleAct(handleSubmit)}
        className="flex min-h-0 w-full flex-grow flex-col items-center justify-between"
      >
        <div className="flex min-h-0 w-full flex-col gap-8">
          <div className="text-xs text-gray-100">{t('description')}</div>
          <Separator />

          <ul className="m-auto mb-4 flex w-1/2 flex-grow flex-col gap-2 overflow-auto">
            {actionData.blockchains.map((blockchain, index) => (
              <li key={`${blockchain.name}-${index}`} className="flex h-12 rounded border-none bg-asphalt px-6 py-4">
                <div className="flex flex-grow items-center justify-between">
                  <label className="flex w-full items-center gap-2.5">
                    <BlockchainIcon blockchain={blockchain.name} type="gray" />
                    <div className="flex-grow">{commonT(`blockchain.${blockchain.name}`)}</div>
                    <Checkbox
                      value={blockchain.name}
                      onCheckedChange={handleSelectedBlockchain.bind(null, index)}
                      checked={blockchain.checked}
                      className="rounded"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button label={t('backButtonLabel')} colorSchema="gray" flat wide onClick={modalNavigateWrapper(-1)} />

          <Button className="w-48" type="submit" label={t('createWalletButtonLabel')} disabled={isDisabled} flat />
        </div>
      </form>
    </CreateWalletModalLayout>
  )
}
