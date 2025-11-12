import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TModalState } from '@shared/types/modal'

type TActionData = {
  name: string
}

const AddNetworkProfileModal = () => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { t } = useTranslation('modals', { keyPrefix: 'addNetworkProfile' })
  const modalState = useModalState<TModalState<'add-network-profile'>>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TActionData>({
    name: modalState?.profile?.name ?? '',
  })

  const modalStateProfile = modalState?.profile

  const isDisabled = actionData.name.trim().length === 0

  const handleSubmit = (data: TActionData) => {
    if (isDisabled) {
      setError('name', t('errors.profileNameIsRequired'))
      return
    }

    if (data.name.length >= 30) {
      setError('name', t('errors.profileNameIsTooLong'))
      return
    }

    dispatch(
      settingsReducerActions.saveNetworkProfile({
        id: modalStateProfile?.id ?? UtilsHelper.uuid(),
        name: data.name,
        networkByBlockchain: modalStateProfile?.networkByBlockchain ?? networkByBlockchain,
      })
    )
    modalNavigate(-1)
  }

  const handleDelete = () => {
    if (!modalStateProfile) return

    dispatch(settingsReducerActions.deleteNetworkProfile(modalStateProfile.id))
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} contentClassName="flex flex-col">
      <form className="flex grow flex-col gap-y-5" onSubmit={handleAct(handleSubmit)}>
        <Input
          label={t('inputLabel')}
          value={actionData.name}
          onChange={setDataFromEventWrapper('name')}
          clearable
          compacted
          errorMessage={actionState.errors.name}
        />

        <div className="flex gap-x-3">
          <Button
            className="w-full"
            type="button"
            onClick={modalNavigateWrapper(-1)}
            label={tCommon('cancel')}
            flat
            colorSchema="gray"
          />

          <Button className="w-full" type="submit" label={tCommon('save')} flat disabled={isDisabled} />
        </div>
      </form>

      {modalStateProfile && (
        <Button
          label={t('deleteButtonLabel')}
          type="button"
          leftIcon={<MdDeleteForever />}
          className="mt-7"
          variant="outlined"
          onClick={handleDelete}
          colorSchema="error"
          flat
          iconsOnEdge={false}
        />
      )}
    </SideModalLayout>
  )
}

export default AddNetworkProfileModal
