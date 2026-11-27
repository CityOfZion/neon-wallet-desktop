import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useDebounceFunction } from '@renderer/hooks/useDebounceFunction'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import type { TModalState } from '@shared/types/modal'

type TActionsData = {
  name: string
  url: string
  validating: boolean
  isValid: boolean
}

const NAME_MAX_LENGTH = 10

const SaveCustomNetwork = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'saveCustomNetwork' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain, network } = useModalState<TModalState<'save-custom-network'>>()
  const dispatch = useAppDispatch()
  const debounce = useDebounceFunction()

  const { actionData, actionState, setDataFromEventWrapper, setData, handleAct, setError, clearErrors } =
    useActions<TActionsData>({
      name: network?.name || '',
      url: network?.url || '',
      validating: false,
      isValid: false,
    })

  const trimmedName = actionData.name.trim()
  const isNameEmpty = trimmedName.length === 0
  const isNameTooLong = trimmedName.length > NAME_MAX_LENGTH

  const handleUrlChange = (url: string) => {
    url = StringHelper.normalizeText(url)

    const validating = !!url

    clearErrors('url')
    setData({ url, isValid: false, validating })

    debounce(async () => {
      if (!validating) return

      if (!UtilsHelper.validateURL(url)) {
        setError('url', t('errors.invalidURL'))
        setData({ validating: false })

        return
      }

      try {
        const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

        await service.pingNetwork(url)

        setData({ isValid: true })
      } catch (error) {
        setError('url', AppError.wrap(error, t('errors.notConnect')).displayMessage)
      } finally {
        setData({ validating: false })
      }
    })
  }

  const handleDelete = () => {
    if (!network) return

    dispatch(settingsReducerActions.deleteCustomNetwork({ blockchain, network }))

    modalNavigate(-1)
  }

  const handleSubmit = (data: TActionsData) => {
    if (isNameEmpty) {
      setError('name', t('errors.networkNameIsRequired'))
      return
    }

    if (isNameTooLong) {
      setError('name', t('errors.networkNameIsTooLong'))
      return
    }

    dispatch(
      settingsReducerActions.saveCustomNetwork({
        blockchain,
        network: {
          name: trimmedName,
          url: data.url,
          id: network?.id || UtilsHelper.uuid(),
          type: 'custom',
        },
      })
    )

    modalNavigate(-1)
  }

  useEffect(() => {
    if (network) {
      handleUrlChange(network.url)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbCube3dSphere aria-hidden />} contentClassName="flex flex-col">
      <form className="flex grow flex-col gap-y-4" onSubmit={handleAct(handleSubmit)}>
        <div className="flex grow flex-col gap-y-4">
          <Input
            compacted
            placeholder={t('namePlaceholder')}
            label={t('nameLabel')}
            value={actionData.name}
            maxLength={NAME_MAX_LENGTH}
            errorMessage={actionState.errors.name}
            onChange={setDataFromEventWrapper('name')}
          />

          <div className="flex flex-col gap-y-2">
            <Input
              compacted
              placeholder={t('urlPlaceholder')}
              label={t('urlLabel')}
              pastable
              value={actionData.url}
              loading={actionData.validating}
              errorMessage={actionState.errors.url}
              onChange={event => handleUrlChange(event.target.value)}
            />

            {actionData.isValid && <Banner message={t('successUrl')} type="success" />}
          </div>
        </div>

        {network && (
          <Button
            label={t('deleteNetworkButtonLabel')}
            type="button"
            variant="outlined"
            colorSchema="error"
            flat
            onClick={handleDelete}
          />
        )}

        <div className="flex flex-col gap-y-8">
          <Separator />

          <div className="flex gap-x-3 px-5">
            <Button
              label={tCommonGeneral('cancel')}
              type="button"
              colorSchema="gray"
              className="w-full"
              flat
              onClick={modalNavigateWrapper(-1)}
            />

            <Button
              label={tCommonGeneral('save')}
              type="submit"
              className="w-full"
              flat
              disabled={!actionData.isValid}
            />
          </div>
        </div>
      </form>
    </SideModalLayout>
  )
}

export default SaveCustomNetwork
