import { useTranslation } from 'react-i18next'
import { MdLooks3 } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
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

  const form = useActions<TFormData>({
    name: '',
  })

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    form.setData({ name: event.target.value })
  }

  const handleSubmit = async ({ name }: TFormData) => {
    const nameTrimmed = name.trim()

    if (nameTrimmed.length <= 0) {
      form.setError('name', t('nameLengthError'))
      return
    }

    modalNavigate('create-wallet-step-4', { state: { nameTrimmed, words } })
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
      <form
        onSubmit={form.handleAct(handleSubmit)}
        className="flex w-full flex-grow flex-col items-center justify-between"
      >
        <div className="flex w-full flex-col gap-8">
          <div className="text-xs text-gray-100">{t('description')}</div>
          <Separator />
          <div className="flex flex-col gap-2.5 px-28">
            <div className="text-xs font-bold uppercase text-gray-300">{t('inputLabel')}</div>
            <Input
              placeholder={t('inputPlaceholder')}
              errorMessage={form.actionState.errors.name}
              value={form.actionData.name}
              onChange={handleChangeName}
              clearable
              compacted
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button label={t('backButtonLabel')} colorSchema="gray" flat wide onClick={modalNavigateWrapper(-1)} />

          <Button className="w-48" type="submit" label={t('nextButtonLabel')} flat />
        </div>
      </form>
    </CreateWalletModalLayout>
  )
}
