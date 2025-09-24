import { useTranslation } from 'react-i18next'
import MdLooks3 from '@renderer/assets/images/md-looks-3.svg?react'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'

type TLocationState = {
  words: string[]
}

type TFormData = {
  name: string
}

export const CreateWalletStep3Modal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step3' })
  const { words } = useModalState<TLocationState>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const MAX_NAME_LENGTH = 30

  const { actionData, actionState, setData, setError, handleAct } = useActions<TFormData>({
    name: '',
  })

  const nameValidation = StringHelper.validateValue(actionData.name, MAX_NAME_LENGTH)
  const isDisabled = !nameValidation.isValid || actionState.isActing

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ name: event.target.value })
  }

  const handleSubmit = async () => {
    if (nameValidation.isEmpty) {
      setError('name', t('errors.walletNameIsTooShort'))
      return
    }

    if (nameValidation.isTooLong) {
      setError('name', t('errors.walletNameIsTooLong', { amount: MAX_NAME_LENGTH }))
      return
    }

    modalNavigate('create-wallet-step-4', { state: { nameTrimmed: nameValidation.trimmedValue, words } })
  }

  return (
    <CreateWalletModalLayout>
      <header className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-x-2.5">
          <MdLooks3 aria-hidden={true} className="h-4.5 w-4.5 text-blue" />
          <h2 className="text-sm">{t('title')}</h2>
        </div>
        <div className="text-sm text-blue">{t('step3of4')}</div>
      </header>
      <Separator className="mb-9 min-h-[0.0625rem]" />
      <form onSubmit={handleAct(handleSubmit)} className="flex w-full flex-grow flex-col items-center justify-between">
        <div className="flex w-full flex-col gap-8">
          <div className="text-xs text-gray-100">{t('description')}</div>
          <Separator />
          <div className="flex flex-col gap-2.5 px-28">
            <div className="text-xs font-bold uppercase text-gray-300">{t('inputLabel')}</div>
            <Input
              placeholder={t('inputPlaceholder')}
              errorMessage={actionState.errors.name}
              value={actionData.name}
              onChange={handleChangeName}
              maxLength={MAX_NAME_LENGTH}
              clearable
              compacted
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button label={t('backButtonLabel')} colorSchema="gray" flat wide onClick={modalNavigateWrapper(-1)} />

          <Button className="w-48" type="submit" label={t('nextButtonLabel')} flat disabled={isDisabled} />
        </div>
      </form>
    </CreateWalletModalLayout>
  )
}
