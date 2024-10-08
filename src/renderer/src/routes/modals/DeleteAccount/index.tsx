import { useTranslation } from 'react-i18next'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  account: IAccountState
}

export const DeleteAccountModal = () => {
  const { account } = useModalState<TLocationState>()
  const { accounts } = useAccountsSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'deleteAccount' })
  const { modalNavigate } = useModalNavigate()
  const { deleteAccount } = useBlockchainActions()

  const handleDelete = () => {
    const idWallet = account.idWallet

    const walletAccounts = accounts.filter(account => account.idWallet === idWallet)

    if (walletAccounts.length === 1) {
      ToastHelper.error({ message: t('deleteLastAccountError') })
    } else {
      deleteAccount(account)
    }

    modalNavigate(-2)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPencil className="text-neon" />}>
      <div className="bg-gray-800 h-full w-full flex flex-col px-4 rounded text-xs items-center justify-between">
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-asphalt flex items-center justify-center">
            <TbTrash className="text-pink w-[5rem] h-[5rem]" />
          </div>
          <p className="text-white text-lg pt-7">{t('deleteAccount')}</p>

          <div className="flex w-full px-3 bg-gray-300/15 rounded min-h-[2rem] items-center justify-center mt-3">
            <p className="text-center text-xs p-2">{StringHelper.truncateStringMiddle(account.name, 45)}</p>
          </div>

          <span className="text-center px-2 text-xs text-gray-100 pt-4">{t('subtitle')}</span>
        </div>
        <div className="flex flex-col w-full items-center">
          <Banner message={t('alert')} type="error" className="mb-7" />
          <Separator />
          <span className="text-xs py-6">{t('warning')}</span>
          <div className="flex gap-2.5 w-full px-6">
            <Button
              flat
              className="w-full"
              variant="contained"
              label={t('cancel')}
              onClick={() => modalNavigate(-1)}
              colorSchema="gray"
            />

            <Button
              flat
              className="w-full"
              variant="outlined"
              label={t('delete')}
              leftIcon={<TbTrash />}
              colorSchema="error"
              onClick={() => handleDelete()}
            />
          </div>
        </div>
      </div>
    </SideModalLayout>
  )
}
