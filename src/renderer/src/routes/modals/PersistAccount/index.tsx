import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { SkinHelper } from '@renderer/helpers/SkinHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useAddAccountHardwareWallet } from '@renderer/hooks/useHardwareWallet'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { authReducerActions } from '@renderer/store/reducers/auth'
import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'
import { TSkin } from '@shared/types/store'

import { SkinSelector } from './SkinSelector'

type TFormData = {
  name: string
  skin: TSkin
}

const MAX_NAME_LENGTH = 50

const PersistAccountModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'persistAccount' })
  const { modalNavigate } = useModalNavigate()
  const modalState = useModalState<TModalState<'persist-account'>>()
  const { createStandardAccount } = useBlockchainActions()
  const { addNewHardwareAccount } = useAddAccountHardwareWallet()
  const dispatch = useAppDispatch()

  const modalStateAccount = modalState?.account
  const modalStateWallet = modalState?.wallet

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setData, setError } = useActions<TFormData>({
    name: modalStateAccount ? modalStateAccount.name : '',
    skin: modalStateAccount ? modalStateAccount.skin : SkinHelper.generateColorSkin(0),
  })

  const nameValidation = StringHelper.validateValue(actionData.name, MAX_NAME_LENGTH)
  const isDisabled = !nameValidation.isValid || actionState.isActing

  const handleSelectColorSkin = (skin: TSkin) => {
    setData({ skin })
  }

  const handleSubmit = async ({ skin }: TFormData) => {
    if (nameValidation.isEmpty) {
      setError('name', t('errors.accountNameIsTooShort'))
      return
    }

    if (nameValidation.isTooLong) {
      setError('name', t('errors.accountNameIsTooLong', { amount: MAX_NAME_LENGTH }))
      return
    }

    if (modalStateAccount) {
      dispatch(authReducerActions.saveAccount({ ...modalStateAccount, name: nameValidation.trimmedValue, skin }))
      modalNavigate(-1)

      return
    }

    if (!modalStateWallet) return

    if (modalStateWallet.type === 'standard') {
      modalNavigate('blockchain-selection', {
        state: {
          heading: t('titleCreate'),
          headingIcon: <TbPlus className="text-neon" />,
          description: t('selectBlockchainDescription'),
          onSelect: async (blockchain: TBlockchainServiceKey) => {
            await createStandardAccount({
              wallet: modalStateWallet,
              blockchain: blockchain,
              name: nameValidation.trimmedValue,
              skin: skin,
            })
            modalNavigate(-2)
          },
        },
      })

      return
    }

    addNewHardwareAccount(modalStateWallet, nameValidation.trimmedValue)
    modalNavigate(-1)
  }

  return (
    <SideModalLayout
      heading={modalStateAccount ? t('titleEdit') : t('titleCreate')}
      headingIcon={modalStateAccount ? <TbPencil aria-hidden /> : <TbPlus aria-hidden className="text-neon" />}
      contentClassName="flex flex-col justify-between"
    >
      <form onSubmit={handleAct(handleSubmit)} className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-2.5 flex flex-col gap-6 text-xs text-gray-100">
            {!modalStateAccount && <p>{t('subtitleCreate')}</p>}
            <p className="font-bold uppercase">{t('inputLabel')}</p>
          </div>

          <Input
            compacted
            placeholder={t('inputPlaceholder')}
            value={actionData.name}
            onChange={setDataFromEventWrapper('name')}
            errorMessage={actionState.errors.name}
            maxLength={MAX_NAME_LENGTH}
            clearable
          />

          <div className="flex flex-col gap-6 pt-4 pb-2">
            {!modalStateAccount && <p className="text-xs text-gray-300 italic">{t('inputSubtitle')}</p>}
            <Separator />
          </div>

          <SkinSelector
            label={t('skinSelectorLabel')}
            onSelectSkin={handleSelectColorSkin}
            selectedSkin={actionData.skin}
            account={modalStateAccount}
          />
        </div>

        <Button
          className="mt-6 w-full"
          type="submit"
          label={modalStateAccount ? t('saveButtonLabel') : t('nextButtonLabel')}
          flat
          disabled={isDisabled}
        />
      </form>

      {modalStateAccount && (
        <div className="mt-8 flex flex-col">
          <Fragment>
            <Separator />
            <p className="mt-4 text-xs font-bold text-gray-300 uppercase">{t('deleteAccountTitle')}</p>
            <span className="mt-2 text-xs text-white">{t('deleteAccountSubtext')}</span>
            <Button
              label={t('deleteAccountTitle')}
              type="button"
              leftIcon={<MdDeleteForever />}
              className="mt-7"
              variant="outlined"
              onClick={() => modalNavigate('delete-account', { state: { account: modalStateAccount } })}
              colorSchema="error"
              flat
            />
          </Fragment>
        </div>
      )}
    </SideModalLayout>
  )
}

export default PersistAccountModal
