import { useLayoutEffect, useState } from 'react'

import { hasWalletConnect } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { NetworkHelper } from '@renderer/helpers/NetworkHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { WalletKitHelper } from '@renderer/helpers/WalletKitHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCustomNetworksSelector, useSelectedNetworkProfileSelector } from '@renderer/hooks/useSettingsSelector'
import { invalidateWalletConnectSessions } from '@renderer/hooks/useWalletConnectSessions'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbCube3dSphere from '@renderer/assets/images/tb-cube-3d-sphere.svg?react'
import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbPlus from '@renderer/assets/images/tb-plus.svg?react'

import { settingsReducerActions } from '@renderer/store/reducers/settings'
import type { TModalState } from '@shared/types/modal'

const NetworkSelectionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkSelection' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain } = useModalState<TModalState<'network-selection'>>()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { customNetworks } = useCustomNetworksSelector()
  const dispatch = useAppDispatch()

  const [selectedNetworkId, setSelectedNetworkId] = useState<string>()

  const networkId = selectedNetworkProfile.networkByBlockchain[blockchain].id
  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]
  const options = service.availableNetworks.concat(...customNetworks[blockchain])
  const selectedNetwork = options.find(option => option.id === selectedNetworkId) || options[0]

  const onSelectRadioItem = (selectedValue: string) => {
    const network = options.find(network => network.id === selectedValue)

    if (!network) return

    setSelectedNetworkId(network.id)
  }

  const handleSave = async () => {
    if (selectedNetworkId !== networkId) {
      if (hasWalletConnect(service)) {
        const sessions = WalletKitHelper.kit.getActiveSessions()

        const filteredSessions = WalletKitHelper.filterSessions(Object.values(sessions), {
          chains: [service.walletConnectService.chain],
        })

        Promise.allSettled(
          filteredSessions.map(session =>
            WalletKitHelper.kit.disconnectSession({
              topic: session.topic,
              reason: WalletKitHelper.getError('USER_DISCONNECTED'),
            })
          )
        ).then(() => invalidateWalletConnectSessions())
      }

      dispatch(
        settingsReducerActions.editNetworkProfile({
          id: selectedNetworkProfile.id,
          networkByBlockchain: {
            [blockchain]: selectedNetwork,
          },
        })
      )
    }

    modalNavigate(-1)
  }

  useLayoutEffect(() => {
    setSelectedNetworkId(networkId)
  }, [networkId])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbCube3dSphere aria-hidden />}
      contentClassName="px-0 flex flex-col"
    >
      <div className="flex grow flex-col gap-y-3">
        <span className="block px-4 text-gray-300" {...TestHelper.buildTestObject('network-selection-select-network')}>
          {t('selectNetwork')}
        </span>

        <RadioGroup.Group value={selectedNetworkId} onValueChange={onSelectRadioItem}>
          {options.map(network => {
            const isDefaultCustomNetwork = NetworkHelper.isDefaultCustomNetwork(network)
            const isCustomNetwork = network.type === 'custom'

            return (
              <RadioGroup.Item
                key={network.id}
                value={network.id}
                {...TestHelper.buildTestObject('network-selection-item')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={StyleHelper.mergeStyles('min-size-1.5 size-1.5 rounded-full', {
                      'bg-neon': network.type === 'mainnet',
                      'bg-magenta': network.type === 'testnet',
                      'bg-blue': isDefaultCustomNetwork,
                      'bg-pink': isCustomNetwork && !isDefaultCustomNetwork,
                    })}
                  />
                  <span>{network.name}</span>
                </div>

                <RadioGroup.Indicator />
              </RadioGroup.Item>
            )
          })}
        </RadioGroup.Group>
      </div>

      {service.isCustomNetworkSupported && (
        <div className="mt-4 flex w-full flex-col gap-y-2 px-4">
          {selectedNetwork.type === 'custom' && !NetworkHelper.isDefaultCustomNetwork(selectedNetwork) && (
            <Button
              label={t('editCustomNetworkButtonLabel')}
              variant="outlined"
              colorSchema="gray"
              flat
              iconsOnEdge={false}
              rightIcon={<TbPencil aria-hidden />}
              onClick={modalNavigateWrapper('add-custom-network', {
                state: { blockchain, network: selectedNetwork },
              })}
              {...TestHelper.buildTestObject('network-selection-edit-custom-network')}
            />
          )}

          <Button
            label={t('addCustomNetworkButtonLabel')}
            variant="outlined"
            flat
            iconsOnEdge={false}
            rightIcon={<TbPlus aria-hidden />}
            onClick={modalNavigateWrapper('add-custom-network', {
              state: { blockchain },
            })}
            {...TestHelper.buildTestObject('network-selection-add-custom-network')}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-y-8 px-4">
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

          <Button
            className="w-full"
            label={tCommonGeneral('save')}
            flat
            onClick={handleSave}
            {...TestHelper.buildTestObject('network-selection-save')}
          />
        </div>
      </div>
    </SideModalLayout>
  )
}

export default NetworkSelectionModal
