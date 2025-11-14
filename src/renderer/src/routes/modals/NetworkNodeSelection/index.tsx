import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Loader } from '@renderer/components/Loader'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { usePingNodes } from '@renderer/hooks/useNodes'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbRefresh from '@renderer/assets/images/tb-refresh.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TModalState } from '@shared/types/modal'

const NetworkNodeSelection = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkNodeSelection' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain } = useModalState<TModalState<'network-node-selection'>>()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const pingNodesQuery = usePingNodes(blockchain)
  const dispatch = useAppDispatch()

  const [selectedUrl, setSelectedUrl] = useState(selectedNetworkProfile.networkByBlockchain[blockchain].url)
  const [isAutomatic, setIsAutomatic] = useState(
    selectedNetworkProfile.networkByBlockchain[blockchain].isAutomatic ?? false
  )

  const handleSelectRadioItem = (selectedValue: string) => {
    setIsAutomatic(false)
    setSelectedUrl(selectedValue)
  }

  const handleIsAutomaticallyChange = (value: boolean) => {
    const firstNode = pingNodesQuery.data?.[0]
    if (firstNode) {
      setSelectedUrl(firstNode.url)
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

      <span className="mt-6 block px-4 font-bold text-gray-100">{t('listLabel')}</span>

      <div className="bg-asphalt mt-4 flex justify-between px-4 py-3.5">
        <Button
          label={t('refreshButtonLabel')}
          leftIcon={<TbRefresh aria-hidden className="text-neon" />}
          variant="text-slim"
          flat
          colorSchema="white"
          onClick={() => pingNodesQuery.refetch()}
        />

        <div className="flex gap-2.5">
          <label className="text-xs font-medium" htmlFor="automatically">
            {t('selectAutomaticallyLabel')}
          </label>
          <Checkbox
            id="automatically"
            checked={isAutomatic}
            onCheckedChange={handleIsAutomaticallyChange}
            disabled={pingNodesQuery.isLoading}
          />
        </div>
      </div>

      <div className="my-3.5 grow overflow-auto">
        {pingNodesQuery.isLoading ? (
          <Loader />
        ) : (
          <RadioGroup.Group value={selectedUrl} onValueChange={handleSelectRadioItem}>
            {pingNodesQuery.data?.map(node => (
              <RadioGroup.Item key={node.url} value={node.url} className="h-15 text-xs">
                <div className="flex min-w-0 grow items-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="flex h-4 w-4 items-center justify-center">
                      <div
                        className={StyleHelper.mergeStyles(
                          'h-1.5 min-h-1.5 w-1.5 min-w-1.5 rounded-full',
                          match(node.latency)
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
                      {typeof node.latency === 'number' ? t('latency', { latency: node.latency }) : '--'}
                    </span>
                  </div>

                  <div className="flex-start flex min-w-0 grow flex-col gap-0.5">
                    <span className="block w-full truncate text-left">{node.url}</span>

                    <span className="text-left text-gray-300">{t('blockHeight', { height: node.height ?? '--' })}</span>
                  </div>
                </div>

                <RadioGroup.Indicator />
              </RadioGroup.Item>
            ))}
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
            label={commonGeneral('cancel')}
            flat
            colorSchema="gray"
          />

          <Button className="w-full" label={commonGeneral('save')} disabled={!selectedUrl} flat onClick={handleSave} />
        </div>
      </div>
    </SideModalLayout>
  )
}

export default NetworkNodeSelection
