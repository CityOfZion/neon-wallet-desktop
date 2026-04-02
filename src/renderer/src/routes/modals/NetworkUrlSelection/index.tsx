import { useState } from 'react'

import { BSNeoXConstants } from '@cityofzion/bs-neox'
import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Loader } from '@renderer/components/Loader'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePingNetworks } from '@renderer/hooks/usePingNetworks'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbRefresh from '@renderer/assets/images/tb-refresh.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TModalState } from '@shared/types/modal'

const NetworkUrlSelection = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkUrlSelection' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain } = useModalState<TModalState<'network-url-selection'>>()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const pingNetworksQuery = usePingNetworks(blockchain)
  const dispatch = useAppDispatch()

  const network = selectedNetworkProfile.networkByBlockchain[blockchain]

  const [selectedUrl, setSelectedUrl] = useState(network.url)
  const [isAutomatic, setIsAutomatic] = useState(network.isAutomatic ?? false)

  const handleSelectRadioItem = (selectedValue: string) => {
    setIsAutomatic(false)
    setSelectedUrl(selectedValue)
  }

  const handleIsAutomaticallyChange = (value: boolean) => {
    const firstNetwork = pingNetworksQuery.data?.[0]
    if (firstNetwork) {
      setSelectedUrl(firstNetwork.url)
    }

    setIsAutomatic(value)
  }

  const handleSave = async () => {
    modalNavigate(-1)
    dispatch(
      settingsReducerActions.editNetworkProfile({
        id: selectedNetworkProfile.id,
        networkByBlockchain: { [blockchain]: { url: selectedUrl, isAutomatic } },
      })
    )
  }

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbCube3dSphere aria-hidden />}
      contentClassName="px-0 flex flex-col"
    >
      <p className="px-4 text-xs text-white">{t('description')}</p>

      <span className="mt-6 block px-4 font-bold text-gray-100 uppercase">{t('listLabel')}</span>

      <div className="bg-asphalt mt-4 flex justify-between px-4 py-3.5">
        <Button
          label={t('refreshButtonLabel')}
          leftIcon={<TbRefresh aria-hidden className="text-neon" />}
          variant="text-slim"
          flat
          colorSchema="white"
          onClick={() => pingNetworksQuery.refetch()}
        />

        <div className="flex gap-2.5">
          <label className="text-xs font-medium" htmlFor="automatically">
            {t('selectAutomaticallyLabel')}
          </label>
          <Checkbox
            id="automatically"
            checked={isAutomatic}
            onCheckedChange={handleIsAutomaticallyChange}
            disabled={pingNetworksQuery.isLoading}
          />
        </div>
      </div>

      <div className="mt-3.5 grow overflow-auto">
        {pingNetworksQuery.isLoading ? (
          <Loader />
        ) : (
          <RadioGroup.Group value={selectedUrl} onValueChange={handleSelectRadioItem}>
            {pingNetworksQuery.data?.map(currentNetwork => {
              const isNeoxAntiMev =
                blockchain === 'neox' &&
                BSNeoXConstants.ANTI_MEV_RPC_LIST_BY_NETWORK_ID[network.id].some(url => url === currentNetwork.url)

              return (
                <RadioGroup.Item key={currentNetwork.url} value={currentNetwork.url} className="h-17 text-xs">
                  <div className="flex min-w-0 grow items-center gap-4">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="flex h-4 w-4 items-center justify-center">
                        <div
                          className={StyleHelper.mergeStyles(
                            'h-1.5 min-h-1.5 w-1.5 min-w-1.5 rounded-full',
                            match(currentNetwork.latency)
                              .with(undefined, () => 'bg-gray-300')
                              .with(
                                P.when(value => value < 400),
                                () => 'bg-green'
                              )
                              .with(
                                P.when(value => value < 800),
                                () => 'bg-orange'
                              )
                              .otherwise(() => 'bg-pink')
                          )}
                        />
                      </div>

                      <span className="min-w-12 text-gray-300">
                        {typeof currentNetwork.latency === 'number'
                          ? t('latency', { latency: currentNetwork.latency })
                          : tCommonGeneral('emptyColumn')}
                      </span>
                    </div>

                    <div className="flex-start flex min-w-0 grow flex-col gap-0.5">
                      {isNeoxAntiMev && (
                        <span className="bg-neon/70 text-asphalt text-1xs mb-0.5 block w-fit rounded px-1.25 py-px text-center font-semibold">
                          {t('antiMevLabel')}
                        </span>
                      )}

                      <span className="block w-full truncate text-left">{currentNetwork.url}</span>

                      <span className="text-left text-gray-300">
                        {t('blockHeight', {
                          height:
                            typeof currentNetwork.height === 'number'
                              ? currentNetwork.height
                              : tCommonGeneral('emptyColumn'),
                        })}
                      </span>
                    </div>
                  </div>

                  <RadioGroup.Indicator />
                </RadioGroup.Item>
              )
            })}
          </RadioGroup.Group>
        )}
      </div>

      <div className="flex flex-col gap-y-8 px-4">
        <Separator />

        <div className="flex gap-x-3 px-5">
          <Button
            className="w-full"
            type="button"
            onClick={modalNavigateWrapper(-1)}
            label={tCommonGeneral('cancel')}
            flat
            colorSchema="gray"
          />

          <Button className="w-full" label={tCommonGeneral('save')} disabled={!selectedUrl} flat onClick={handleSave} />
        </div>
      </div>
    </SideModalLayout>
  )
}

export default NetworkUrlSelection
