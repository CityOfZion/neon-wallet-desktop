import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { IWalletState } from '@shared/@types/store'

type TFormData = {
  name: string
}

type TLocationState = {
  wallet: IWalletState
}

const EditWalletModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'editWallet' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { wallet } = useModalState<TLocationState>()
  const MAX_NAME_LENGTH = 30

  const dispatch = useAppDispatch()

  const { setData, setError, actionState, actionData, handleAct } = useActions<TFormData>({
    name: wallet.name,
  })

  const nameValidation = StringHelper.validateValue(actionData.name, MAX_NAME_LENGTH)
  const isDisabled = !nameValidation.isValid || actionState.isActing

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ name: event.target.value })
  }

  const handleSubmit = () => {
    if (nameValidation.isEmpty) {
      setError('name', t('errors.walletNameIsTooShort'))
      return
    }

    if (nameValidation.isTooLong) {
      setError('name', t('errors.walletNameIsTooLong', { amount: MAX_NAME_LENGTH }))
      return
    }

    dispatch(authReducerActions.saveWallet({ ...wallet, name: nameValidation.trimmedValue }))
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbPencil aria-hidden />} contentClassName="flex flex-col">
      <form onSubmit={handleAct(handleSubmit)} className="flex grow flex-col">
        <Input
          placeholder={t('inputPlaceholder')}
          errorMessage={actionState.errors.name}
          value={actionData.name}
          onChange={handleChangeName}
          clearable
          maxLength={MAX_NAME_LENGTH}
          compacted
        />

        <Separator className="my-4" />

        <div className="mt-auto mb-4 flex gap-x-3">
          <Button
            className="w-full"
            type="button"
            onClick={modalNavigateWrapper(-1)}
            label={t('cancelButtonLabel')}
            flat
            colorSchema="gray"
          />

          <Button className="w-full" type="submit" label={t('saveButtonLabel')} disabled={isDisabled} flat />
        </div>
      </form>

      <div className="flex flex-col">
        <Separator />

        <p className="mt-4 text-xs font-bold text-gray-300 uppercase">{t('deleteWalletTitle')}</p>
        <span className="mt-2 text-xs text-white">{t('deleteWalletSubtext')}</span>

        <Button
          label={t('deleteWalletButtonLabel')}
          type="button"
          leftIcon={<MdDeleteForever aria-hidden />}
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

export default EditWalletModal
