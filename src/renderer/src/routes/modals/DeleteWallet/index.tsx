import { useTranslation } from 'react-i18next'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbTrash from '@renderer/assets/images/tb-trash.svg?react'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { ToastHelper } from '@renderer/helpers/ToastHelper'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useWalletsSelector } from '@renderer/hooks/useWalletSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IWalletState } from '@shared/@types/store'

type TLocationState = {
  wallet: IWalletState
}

export const DeleteWalletModal = () => {
  const { wallet } = useModalState<TLocationState>()
  const { t } = useTranslation('modals', { keyPrefix: 'deleteWallet' })
  const { wallets } = useWalletsSelector()
  const { modalNavigate } = useModalNavigate()
  const { deleteWallet } = useBlockchainActions()

  const handleDelete = async () => {
    const isLastWallet = wallets.length === 1 && wallets[0].id === wallet.id
    if (isLastWallet) {
      ToastHelper.error({ message: t('deleteLastWalletError') })
    } else {
      const isHardwareWalletConnected =
        wallet.type === 'hardware' && wallet.accounts.some(account => account.type === 'hardware')

      if (isHardwareWalletConnected) await window.api.sendAsync('hardwareWallet:disconnect')

      deleteWallet(wallet.id)
    }

    modalNavigate(-2)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPencil aria-hidden={true} className="text-neon" />}>
      <div className="flex h-full w-full flex-col items-center justify-between rounded bg-gray-800 px-4 text-xs">
        <div className="flex flex-col items-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-asphalt">
            <TbTrash aria-hidden={true} className="h-[5rem] w-[5rem] text-pink" />
          </div>
          <p className="pt-7 text-lg text-white">{t('deleteWallet')}</p>

          <div className="mt-3 flex min-h-[2rem] w-full items-center justify-center rounded bg-gray-300/15 px-3">
            <p className="p-2 text-center text-xs">{StringHelper.truncateStringMiddle(wallet.name, 45)}</p>
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
              onClick={() => modalNavigate(-1)}
              colorSchema="gray"
            />
            <Button
              flat
              className="w-full"
              variant="outlined"
              label={t('delete')}
              leftIcon={<TbTrash aria-hidden={true} />}
              colorSchema="error"
              onClick={() => handleDelete()}
            />
          </div>
        </div>
      </div>
    </SideModalLayout>
  )
}
