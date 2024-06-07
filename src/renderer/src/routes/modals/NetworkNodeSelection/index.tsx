import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tb3DCubeSphere, TbRefresh } from 'react-icons/tb'
import { TBlockchainServiceKey, TNetwork } from '@renderer/@types/blockchain'
import { Button } from '@renderer/components/Button'
import { Checkbox } from '@renderer/components/Checkbox'
import { Loader } from '@renderer/components/Loader'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { Separator } from '@renderer/components/Separator'
import { DEFAULT_NETWORK_URL_BY_BLOCKCHAIN } from '@renderer/constants/networks'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useNodes } from '@renderer/hooks/useNodes'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TState = {
  onNetworkNodeChange: (url: string) => void | Promise<void>
  network: TNetwork
  blockchain: TBlockchainServiceKey
}

export const NetworkNodeSelection = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'networkNodeSelection' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()
  const { network, onNetworkNodeChange, blockchain } = useModalState<TState>()
  const query = useNodes(blockchain)

  const [selectedUrl, setSelectedUrl] = useState<string>(network.url)
  const [isAutomatically, setIsAutomatically] = useState<boolean>(
    network.url === DEFAULT_NETWORK_URL_BY_BLOCKCHAIN[blockchain][network.type]
  )

  const handleSelectRadioItem = (selectedValue: string) => {
    setIsAutomatically(false)
    setSelectedUrl(selectedValue)
  }

  const handleIsAutomaticallyChange = (value: boolean) => {
    if (value) {
      setSelectedUrl(DEFAULT_NETWORK_URL_BY_BLOCKCHAIN[blockchain][network.type])
    }

    setIsAutomatically(value)
  }

  const handleSave = async () => {
    modalNavigate(-1)
    onNetworkNodeChange(selectedUrl)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<Tb3DCubeSphere />} contentClassName="px-0 flex flex-col">
      <p className="text-xs text-white px-4">{t('description')}</p>

      <span className="text-gray-100 font-bold mt-6 block px-4">{t('listLabel')}</span>

      <div className="py-3.5 bg-asphalt px-4 mt-4 flex justify-between">
        <Button
          label={t('refreshButtonLabel')}
          leftIcon={<TbRefresh className="text-neon" />}
          variant="text-slim"
          flat
          colorSchema="white"
          onClick={() => query.refetch()}
        />

        <div className="flex gap-2.5">
          <label className="text-xs font-medium" htmlFor="automatically">
            {t('selectAutomaticallyLabel')}
          </label>
          <Checkbox id="automatically" checked={isAutomatically} onCheckedChange={handleIsAutomaticallyChange} />
        </div>
      </div>

      <div className="overflow-auto flex-grow my-3.5">
        {query.isLoading ? (
          <Loader />
        ) : (
          <RadioGroup.Group value={selectedUrl} onValueChange={handleSelectRadioItem}>
            {query.data?.map(node => (
              <RadioGroup.Item key={node.url} value={node.url} className="h-15 text-xs">
                <div className="flex items-center gap-4 flex-grow  min-w-0">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div
                        className={StyleHelper.mergeStyles(
                          'w-[0.375rem] h-[0.375rem] min-w-[0.375rem] min-h-[0.375rem] rounded-full',
                          node.latency < 400 ? 'bg-green' : node.latency < 800 ? 'bg-orange' : 'bg-pink'
                        )}
                      />
                    </div>

                    <span className="text-gray-300 ">{t('latency', { latency: node.latency })}</span>
                  </div>

                  <div className="flex flex-col flex-start gap-0.5 flex-grow min-w-0">
                    <span className="truncate block text-left w-full">{node.url}</span>
                    <span className="text-gray-300 text-left">{t('blockHeight', { height: node.height })}</span>
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

          <Button className="w-full" label={commonGeneral('save')} flat onClick={handleSave} />
        </div>
      </div>
    </SideModalLayout>
  )
}
