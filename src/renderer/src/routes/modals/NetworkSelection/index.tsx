import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tb3DCubeSphere } from 'react-icons/tb'
import { TBlockchainServiceKey, TNetwork } from '@renderer/@types/blockchain'
import { Button } from '@renderer/components/Button'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'
import { COLOR_BY_NETWORK_TYPE, NETWORK_OPTIONS_BY_BLOCKCHAIN } from '@renderer/constants/networks'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TState = {
  onNetworkChange: (network: TNetwork) => void | Promise<void>
  network: TNetwork
  blockchain: TBlockchainServiceKey
}

export const NetworkSelection = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkSelection' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { network, onNetworkChange, blockchain } = useModalState<TState>()

  const [selectedNetwork, setSelectedNetwork] = useState<TNetwork>(network)

  const onSelectRadioItem = (selectedValue: string) => {
    const network = NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].find(network => network.id === selectedValue) as TNetwork
    setSelectedNetwork(network)
  }

  const handleSave = async () => {
    modalNavigate(-1)
    onNetworkChange(selectedNetwork)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<Tb3DCubeSphere />} contentClassName="px-0 flex flex-col">
      <div className="flex-grow">
        <span className="mb-5 block px-4 text-gray-300">{t('selectNetwork')}</span>

        <RadioGroup.Group value={selectedNetwork.id} onValueChange={onSelectRadioItem}>
          {NETWORK_OPTIONS_BY_BLOCKCHAIN[blockchain].map(network => (
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
