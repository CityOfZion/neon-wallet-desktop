import { useTranslation } from 'react-i18next'
import { MdDeleteForever } from 'react-icons/md'
import { TNetworkProfile } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkByBlockchainSelector } from '@renderer/hooks/useSettingsSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'

type TModalState = {
  profile?: TNetworkProfile
}

type TActionData = {
  name: string
}

export const AddNetworkProfileModal = () => {
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'general' })
  const { t } = useTranslation('modals', { keyPrefix: 'addNetworkProfileModal' })
  const { profile } = useModalState<TModalState>()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const dispatch = useAppDispatch()
  const { networkByBlockchain } = useSelectedNetworkByBlockchainSelector()

  const { actionData, actionState, setDataFromEventWrapper, setError, handleAct } = useActions<TActionData>({
    name: profile?.name ?? '',
  })

  const handleSubmit = (data: TActionData) => {
    if (data.name.length === 0) {
      setError('name', t('errors.profileNameIsRequired'))
      return
    }

    if (data.name.length >= 30) {
      setError('name', t('errors.profileNameIsTooLong'))
      return
    }

    dispatch(
      settingsReducerActions.saveNetworkProfile({
        id: profile?.id ?? UtilsHelper.uuid(),
        name: data.name,
        networkByBlockchain: profile?.networkByBlockchain ?? networkByBlockchain,
      })
    )
    modalNavigate(-1)
  }

  const handleDelete = () => {
    if (!profile) return

    dispatch(settingsReducerActions.deleteNetworkProfile(profile.id))
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} contentClassName="flex flex-col">
      <form className="flex flex-col gap-y-5 flex-grow" onSubmit={handleAct(handleSubmit)}>
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

          <Button className="w-full" type="submit" label={tCommon('save')} flat />
        </div>
      </form>

      {profile && (
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
