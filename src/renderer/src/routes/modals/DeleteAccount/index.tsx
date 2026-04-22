import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { useDeleteAccount } from '@renderer/hooks/useAccountActions'
import { useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbTrash from '@renderer/assets/images/tb-trash.svg?react'

import type { TModalState } from '@shared/types/modal'

const DeleteAccountModal = () => {
  const { account } = useModalState<TModalState<'delete-account'>>()
  const { accounts } = useAccountsSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'deleteAccount' })
  const { modalErase, modalNavigateWrapper } = useModalNavigate()
  const { deleteAccount } = useDeleteAccount()

  const handleDelete = () => {
    const idWallet = account.idWallet

    const walletAccounts = accounts.filter(account => account.idWallet === idWallet)

    if (walletAccounts.length === 1) {
      ToastHelper.error({ message: t('deleteLastAccountError') })
    } else {
      deleteAccount(account)
    }

    modalErase()
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPencil aria-hidden className="text-neon" />} size="md">
      <div className="flex h-full w-full flex-col items-center justify-between rounded-sm px-4 text-xs">
        <div className="flex flex-col items-center">
          <div className="bg-asphalt flex h-36 w-36 items-center justify-center rounded-full">
            <TbTrash aria-hidden className="text-pink h-20 w-20" />
          </div>
          <p className="pt-7 text-lg text-white">{t('deleteAccount')}</p>

          <div className="mt-3 flex min-h-8 w-full items-center justify-center rounded-sm bg-gray-300/15 px-3">
            <p className="p-2 text-center text-xs">{StringHelper.truncateMiddle(account.name, 45)}</p>
          </div>

          <span className="px-2 pt-4 text-center text-xs text-gray-100">{t('subtitle')}</span>
        </div>
        <div className="flex w-full flex-col items-center">
          <Banner message={t('alert')} type="error" className="mb-7" />
          <Separator />
          <span className="py-6 text-xs">{t('warning')}</span>
          <div className="flex w-full gap-2.5 px-6">
            <Button
              flat
              className="w-full"
              variant="contained"
              label={t('cancel')}
              onClick={modalNavigateWrapper(-1)}
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

export default DeleteAccountModal
