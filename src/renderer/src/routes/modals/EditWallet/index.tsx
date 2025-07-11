import { useTranslation } from 'react-i18next'
import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { authReducerActions } from '@renderer/store/reducers/AuthReducer'
import { IWalletState } from '@shared/@types/store'

type TFormData = {
  name: string
}

type TLocationState = {
  wallet: IWalletState
}

export const EditWalletModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'editWallet' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { wallet } = useModalState<TLocationState>()

  const dispatch = useAppDispatch()

  const form = useActions<TFormData>({
    name: wallet.name,
  })

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setData({ name: event.target.value })
  }

  const handleSubmit = ({ name }: TFormData) => {
    const nameTrimmed = name.trim()
    if (nameTrimmed.length <= 0) {
      form.setError('name', t('nameLengthError'))
      return
    }
    dispatch(authReducerActions.saveWallet({ ...wallet, name: nameTrimmed }))
    modalNavigate(-1)
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbPencil aria-hidden={true} />}
      contentClassName="flex flex-col"
    >
      <form onSubmit={form.handleAct(handleSubmit)} className="flex flex-grow flex-col">
        <Input
          placeholder={t('inputPlaceholder')}
          errorMessage={form.actionState.errors.name}
          value={form.actionData.name}
          onChange={handleChangeName}
          clearable
          compacted
        />

        <Separator className="my-4" />

        <div className="mb-4 mt-auto flex gap-x-3">
          <Button
            className="w-full"
            type="button"
            onClick={modalNavigateWrapper(-1)}
            label={t('cancelButtonLabel')}
            flat
            colorSchema="gray"
          />

          <Button className="w-full" type="submit" label={t('saveButtonLabel')} flat />
        </div>
      </form>

      <div className="flex flex-col">
        <Separator />

        <p className="mt-4 text-xs font-bold uppercase text-gray-300">{t('deleteWalletTitle')}</p>
        <span className="mt-2 text-xs text-white">{t('deleteWalletSubtext')}</span>

        <Button
          label="Delete Wallet"
          type="button"
          leftIcon={<MdDeleteForever aria-hidden={true} />}
          className="mt-7"
          variant="outlined"
          onClick={() => modalNavigate('delete-wallet', { state: { wallet } })}
          colorSchema="error"
          flat
          iconsOnEdge={false}
        />
      </div>
    </SideModalLayout>
  )
}
