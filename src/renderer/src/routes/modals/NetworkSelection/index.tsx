import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tb3DCubeSphere, TbPencil, TbPlus } from 'react-icons/tb'
import { TBlockchainServiceKey, TNetwork } from '@renderer/@types/blockchain'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'
import {
  BLOCKCHAIN_WITH_CUSTOM_NETWORK,
  COLOR_BY_NETWORK_TYPE,
  NETWORK_OPTIONS_BY_BLOCKCHAIN,
} from '@renderer/constants/networks'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import {
  useCustomNetworksSelector,
  useNetworkActions,
  useSelectedNetworkSelector,
} from '@renderer/hooks/useSettingsSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TState = {
  blockchain: TBlockchainServiceKey
}

export const NetworkSelection = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkSelection' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { blockchain } = useModalState<TState>()
  const { setNetwork } = useNetworkActions()
  const { network } = useSelectedNetworkSelector(blockchain)
  const { customNetworks } = useCustomNetworksSelector()

  const [selectedNetwork, setSelectedNetwork] = useState<TNetwork>(network)

  const options = NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].concat(...customNetworks[blockchain])

  const onSelectRadioItem = (selectedValue: string) => {
    const network = options.find(network => network.id === selectedValue)
    if (!network) return

    setSelectedNetwork(network)
  }

  const handleSave = async () => {
    modalNavigate(-1)
    setNetwork(blockchain, selectedNetwork)
  }

  useEffect(() => {
    if (network.id !== selectedNetwork.id) setSelectedNetwork(network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  return (
    <SideModalLayout heading={t('title')} headingIcon={<Tb3DCubeSphere />} contentClassName="px-0 flex flex-col">
      <div className="flex-grow">
        <span className="mb-5 block px-4 text-gray-300">{t('selectNetwork')}</span>

        <RadioGroup.Group value={selectedNetwork.id} onValueChange={onSelectRadioItem}>
          {options.map(network => (
            <RadioGroup.Item key={network.id} value={network.id}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-[0.375rem] h-[0.375rem] min-w-[0.375rem] min-h-[0.375rem] rounded-full ${COLOR_BY_NETWORK_TYPE[network.type]}`}
                />
                <label>{network.name}</label>
              </div>

              <RadioGroup.Indicator />
            </RadioGroup.Item>
          ))}
        </RadioGroup.Group>
      </div>

      {BLOCKCHAIN_WITH_CUSTOM_NETWORK.includes(blockchain) && (
        <Fragment>
          {selectedNetwork.type === 'custom' && (
            <Button
              label={t('editCustomNetworkButtonLabel')}
              rightIcon={<TbPencil />}
              className="px-4 mb-2.5"
              flat
              colorSchema="gray"
              variant="outlined"
              iconsOnEdge={false}
              onClick={modalNavigateWrapper('add-custom-network', { state: { blockchain, network: selectedNetwork } })}
            />
          )}

          <Button
            label={t('addCustomNetworkButtonLabel')}
            rightIcon={<TbPlus />}
            className="px-4 mb-2.5"
            flat
            variant="outlined"
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('add-custom-network', { state: { blockchain } })}
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
