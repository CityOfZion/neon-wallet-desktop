import { useTranslation } from 'react-i18next'
import { Tb3DCubeSphere } from 'react-icons/tb'
import { useDispatch } from 'react-redux'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'
import { CUSTOM_NETWORK_ID } from '@renderer/constants/networks'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useActions } from '@renderer/hooks/useActions'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { bsAggregator } from '@renderer/libs/blockchainService'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TBlockchainServiceKey, TNetwork } from '@shared/@types/blockchain'
import { cloneDeep } from 'lodash'

type TState = {
  blockchain: TBlockchainServiceKey
  network?: TNetwork<TBlockchainServiceKey>
}

type TActionData = {
  name: string
  url: string
  validating: boolean
  isValid: boolean
}

export const AddCustomNetwork = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'addCustomNetwork' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain, network: networkToEdit } = useModalState<TState>()
  const dispatch = useDispatch()

  const { actionData, actionState, setDataFromEventWrapper, setData, handleAct, setError, clearErrors } =
    useActions<TActionData>({
      name: networkToEdit?.name ?? '',
      url: networkToEdit?.url ?? '',
      validating: false,
      isValid: networkToEdit ? true : false,
    })

  const handleUrlBlur = async () => {
    setData({ isValid: false })

    if (!UtilsHelper.validateURL(actionData.url)) {
      setError('url', t('errors.invalidURL'))
      return
    }

    setData({ validating: true })

    try {
      const service = bsAggregator.blockchainServicesByName[blockchain]
      const clonedService = cloneDeep(service)

      clonedService.setNetwork({ id: CUSTOM_NETWORK_ID, name: actionData.name, url: actionData.url })
      await service.blockchainDataService.getBlockHeight()
      clearErrors('url')
      setData({ isValid: true })
    } catch {
      setError('url', t('errors.notConnect'))
    } finally {
      setData({ validating: false })
    }
  }

  const handleDelete = () => {
    if (!networkToEdit) return

    dispatch(settingsReducerActions.deleteCustomNetwork({ blockchain, network: networkToEdit }))
    modalNavigate(-1)
  }

  const handleSubmit = (data: TActionData) => {
    if (data.name.length === 0) {
      setError('name', t('errors.networkNameIsRequired'))
      return
    }

    if (data.name.length > 10) {
      setError('name', t('errors.networkNameIsTooLong'))
      return
    }

    dispatch(
      settingsReducerActions.saveCustomNetwork({
        blockchain,
        network: {
          name: data.name,
          url: data.url,
          id: networkToEdit?.id ?? `${CUSTOM_NETWORK_ID}-${UtilsHelper.uuid()}`,
        },
      })
    )
    modalNavigate(-1)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<Tb3DCubeSphere />} contentClassName="flex flex-col">
      <form className="flex flex-col flex-grow" onSubmit={handleAct(handleSubmit)}>
        <div className="flex-grow flex flex-col gap-6">
          <Input
            compacted
            placeholder={t('namePlaceholder')}
            label={t('nameLabel')}
            value={actionData.name}
            errorMessage={actionState.errors.name}
            onChange={setDataFromEventWrapper('name')}
          />

          <Input
            compacted
            placeholder={t('urlPlaceholder')}
            label={t('urlLabel')}
            value={actionData.url}
            onChange={setDataFromEventWrapper('url')}
            loading={actionData.validating}
            errorMessage={actionState.errors.url}
            onBlur={handleUrlBlur}
          />

          {actionData.isValid && <Banner message={t('successUrl')} type="success" />}
        </div>

        {networkToEdit && (
          <Button
            label={t('deleteButtonLabel')}
            className="mb-2.5"
            flat
            variant="outlined"
            colorSchema="error"
            type="button"
            onClick={handleDelete}
          />
        )}

        <div className="flex flex-col gap-y-8">
          <Separator />

          <div className="flex gap-x-3 px-5">
            <Button
              className="w-full"
              type="button"
              onClick={modalNavigateWrapper(-1)}
              label={commonGeneral('cancel')}
              flat
              colorSchema="gray"
            />

            <Button
              className="w-full"
              label={commonGeneral('save')}
              flat
              disabled={!actionState.isValid && !actionData.isValid}
            />
          </div>
        </div>
      </form>
    </SideModalLayout>
  )
}
