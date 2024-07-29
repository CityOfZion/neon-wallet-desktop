import { useTranslation } from 'react-i18next'
import { MdDeleteForever } from 'react-icons/md'
import { TbPencil, TbPlus } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { ACCOUNT_COLOR_SKINS } from '@renderer/constants/skins'
import { useActions } from '@renderer/hooks/useActions'
import { useBlockchainActions } from '@renderer/hooks/useBlockchainActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { accountReducerActions } from '@renderer/store/reducers/AccountReducer'
import { TBlockchainServiceKey } from '@shared/@types/blockchain'
import { IAccountState, IWalletState, TNftSkin, TSkin } from '@shared/@types/store'

import { SkinSelector } from './SkinSelector'

type TFormData = {
  name: string
  skin: TSkin
  lastNftSkin?: TNftSkin
}

type TLocationState = {
  account?: IAccountState
  wallet?: IWalletState
}

export const PersistAccountModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'persistAccount' })
  const { modalNavigate } = useModalNavigate()
  const { account, wallet } = useModalState<TLocationState>()
  const { createAccount } = useBlockchainActions()

  const dispatch = useAppDispatch()

  const { actionData, actionState, handleAct, setDataFromEventWrapper, setData, setError } = useActions<TFormData>({
    name: account ? account.name : '',
    skin: account ? account.skin : { id: ACCOUNT_COLOR_SKINS[0].id, type: 'color' },
    lastNftSkin: account ? account.lastNftSkin : undefined,
  })

  const handleSelectColorSkin = (skin: TSkin) => {
    setData({ skin })
  }

  const handleSubmit = async ({ name, skin, lastNftSkin }: TFormData) => {
    const nameTrimmed = name.trim()
    if (nameTrimmed.length === 0) {
      setError('name', t('nameLengthError'))
      return
    }

    if (account) {
      dispatch(accountReducerActions.saveAccount({ ...account, name: nameTrimmed, skin, lastNftSkin }))
      modalNavigate(-1)
    }
    if (wallet) {
      modalNavigate('blockchain-selection', {
        state: {
          heading: t('titleCreate'),
          headingIcon: <TbPlus className="text-neon" />,
          description: t('selectBlockchainDescription'),
          onSelect: async (blockchain: TBlockchainServiceKey) => {
            createAccount({
              wallet,
              blockchain: blockchain,
              name: nameTrimmed,
              skin: skin,
            })
            modalNavigate(-2)
          },
        },
      })
    }
  }

  return (
    <SideModalLayout
      heading={account ? t('titleEdit') : t('titleCreate')}
      headingIcon={account ? <TbPencil /> : <TbPlus className="text-neon" />}
      contentClassName="flex flex-col justify-between"
    >
      <form onSubmit={handleAct(handleSubmit)} className="flex flex-col h-full justify-between">
        <div>
          <div className="flex flex-col text-gray-100 text-xs gap-6 mb-2.5">
            {!account && <p>{t('subtitleCreate')}</p>}
            <p className="uppercase font-bold">{t('inputLabel')}</p>
          </div>

          <Input
            compacted
            placeholder={t('inputPlaceholder')}
            value={actionData.name}
            onChange={setDataFromEventWrapper('name')}
            errorMessage={actionState.errors.name}
            clearable
          />

          <div className="flex flex-col gap-6 pb-2 pt-4">
            {!account && <p className="text-gray-300 italic text-xs">{t('inputSubtitle')}</p>}
            <Separator />
          </div>

          <SkinSelector
            label={t('colorSelectorLabel')}
            onSelectSkin={handleSelectColorSkin}
            selectedSkin={actionData.skin}
          />
        </div>

        <Button
          className="w-full"
          type="submit"
          label={account ? t('saveButtonLabel') : t('nextButtonLabel')}
          flat
          disabled={!actionState.isValid}
        />
      </form>

      {account && (
        <div className="flex flex-col mt-8">
          <>
            <Separator />
            <p className="text-gray-300 uppercase text-xs font-bold mt-4">{t('deleteAccountTitle')}</p>
            <span className="text-xs text-white mt-2">{t('deleteAccountSubtext')}</span>
            <Button
              label={t('deleteAccountTitle')}
              type="button"
              leftIcon={<MdDeleteForever />}
              className="mt-7"
              variant="outlined"
              onClick={() => modalNavigate('delete-account', { state: { account: account } })}
              colorSchema="error"
              flat
            />
          </>
        </div>
      )}
    </SideModalLayout>
  )
}
