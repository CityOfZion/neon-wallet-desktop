import { useTranslation } from 'react-i18next'

import { BlockchainList } from '@renderer/components/BlockchainList'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useCreateStandardAccount } from '@renderer/hooks/useAccountActions'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useCreateWallet } from '@renderer/hooks/useWalletActions'

import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'

import MdLooks4 from '@renderer/assets/images/md-looks-4.svg?react'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

type TFormData = {
  selectedBlockchains: TBlockchainServiceKey[]
}

const CreateWalletStep4Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step4' })
  const { t: commonT } = useTranslation('common')
  const { nameTrimmed, words } = useModalState<TModalState<'create-wallet-step-4'>>()
  const { modalNavigate, modalNavigateWrapper, modalErase } = useModalNavigate()
  const { createStandardAccount } = useCreateStandardAccount()
  const { createWallet } = useCreateWallet()

  const { actionData, actionState, setData, handleAct } = useActions<TFormData>({
    selectedBlockchains: BlockchainServiceHelper.blockchainNames,
  })

  const isDisabled = actionData.selectedBlockchains.length === 0

  const handleSubmit = async () => {
    const wallet = createWallet({
      name: nameTrimmed,
      mnemonic: words.join(' '),
    })

    const accounts = await Promise.allSettled(
      actionData.selectedBlockchains.map(blockchain =>
        createStandardAccount({
          wallet,
          blockchain,
          name: commonT('account.defaultName', { accountNumber: 1 }),
        })
      )
    )

    const createdAccounts = accounts.filter(result => result.status === 'fulfilled').map(result => result.value)

    modalErase()
    modalNavigate('create-wallet-step-5', { state: { accounts: createdAccounts } })
  }

  const handleSelect = (blockchains: TBlockchainServiceKey[]) => {
    setData({ selectedBlockchains: blockchains })
  }

  return (
    <CreateWalletModalLayout
      className={StyleHelper.mergeStyles({
        'pointer-events-none': actionState.isActing,
      })}
    >
      <header className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-x-2.5">
          <MdLooks4 className="text-blue h-4.5 w-4.5" aria-hidden />
          <h2 className="text-sm">{t('title')}</h2>
        </div>
        <div className="text-blue text-sm">{t('step4of4')}</div>
      </header>
      <Separator className="mb-9 min-h-px" />

      <form
        onSubmit={handleAct(handleSubmit)}
        className="flex min-h-0 w-full grow flex-col items-center justify-between"
      >
        <div className="flex min-h-0 w-full flex-col gap-8">
          <div className="text-xs text-gray-100">{t('description')}</div>
          <Separator />

          <BlockchainList selectedBlockchains={actionData.selectedBlockchains} onSelect={handleSelect} isMulti />
        </div>

        <div className="flex gap-2">
          <Button
            label={t('backButtonLabel')}
            colorSchema="gray"
            flat
            wide
            disabled={actionState.isActing}
            onClick={modalNavigateWrapper(-1)}
          />

          <Button
            className="w-48"
            type="submit"
            loading={actionState.isActing}
            label={t('createWalletButtonLabel')}
            disabled={isDisabled}
            flat
          />
        </div>
      </form>
    </CreateWalletModalLayout>
  )
}

export default CreateWalletStep4Modal
