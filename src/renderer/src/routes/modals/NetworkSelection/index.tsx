import { Fragment, useLayoutEffect, useState } from 'react'

import { hasWalletConnect } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
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
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain } = useModalState<TModalState<'network-selection'>>()
  const { selectedNetworkProfile } = useSelectedNetworkProfileSelector()
  const { customNetworks } = useCustomNetworksSelector()
  const dispatch = useAppDispatch()

  const [selectedNetworkId, setSelectedNetworkId] = useState<string>()

  const service = BlockchainServiceHelper.bsAggregator.blockchainServicesByName[blockchain]

  const options = service.availableNetworks.concat(...customNetworks[blockchain])

  const selectedNetwork = options.find(option => option.id === selectedNetworkId) ?? options[0]

  const onSelectRadioItem = (selectedValue: string) => {
    const network = options.find(network => network.id === selectedValue)
    if (!network) return

    setSelectedNetworkId(network.id)
  }

  const handleSave = async () => {
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

    modalNavigate(-1)
  }

  useLayoutEffect(() => {
    setSelectedNetworkId(selectedNetworkProfile.networkByBlockchain[blockchain].id)
  }, [blockchain, selectedNetworkProfile.networkByBlockchain])

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbCube3dSphere aria-hidden />}
      contentClassName="px-0 flex flex-col"
    >
      <div className="min-h-0 grow overflow-auto">
        <span className="mb-5 block px-4 text-gray-300">{t('selectNetwork')}</span>

        <RadioGroup.Group value={selectedNetworkId} onValueChange={onSelectRadioItem}>
          {options.map(network => (
            <RadioGroup.Item key={network.id} value={network.id}>
              <div className="flex items-center gap-4">
                <div
                  className={StyleHelper.mergeStyles('h-1.5 min-h-1.5 w-1.5 min-w-1.5 rounded-full', {
                    'bg-neon': network.type === 'mainnet',
                    'bg-magenta': network.type === 'testnet',
                    'bg-pink': network.type === 'custom',
                  })}
                />
                <label>{network.name}</label>
              </div>

              <RadioGroup.Indicator />
            </RadioGroup.Item>
          ))}
        </RadioGroup.Group>
      </div>

      {service.isCustomNetworkSupported && (
        <Fragment>
          {selectedNetwork.type === 'custom' && (
            <Button
              label={t('editCustomNetworkButtonLabel')}
              rightIcon={<TbPencil aria-hidden />}
              className="mb-2.5 px-4"
              flat
              colorSchema="gray"
              variant="outlined"
              iconsOnEdge={false}
              onClick={modalNavigateWrapper('add-custom-network', {
                state: { blockchain, network: selectedNetwork },
              })}
            />
          )}

          <Button
            label={t('addCustomNetworkButtonLabel')}
            rightIcon={<TbPlus aria-hidden />}
            className="mb-2.5 px-4"
            flat
            variant="outlined"
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('add-custom-network', {
              state: { blockchain },
            })}
          />
        </Fragment>
      )}

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

          <Button className="w-full" label={commonGeneral('save')} flat onClick={handleSave} />
        </div>
      </div>
    </SideModalLayout>
  )
}

export default NetworkSelectionModal
