import { useTranslation } from 'react-i18next'
import { MdRestartAlt } from 'react-icons/md'
import { MdOutlineLanguage } from 'react-icons/md'
import { TbChevronRight } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { useNetworkTypeActions, useNetworkTypeSelector } from '@renderer/hooks/useSettingsSelector'
import { SettingsLayout } from '@renderer/layouts/Settings'

export const SettingsNetwork = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsNetwork' })
  const { t: commonT } = useTranslation('common', { keyPrefix: 'networkTypeLabel' })
  const { t: commonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { modalNavigateWrapper } = useModalNavigate()
  const { networkType } = useNetworkTypeSelector()
  const { handleChangeNetwork } = useNetworkTypeActions()

  return (
    <SettingsLayout
      title={t('title')}
      actions={
        <Button
          leftIcon={<MdRestartAlt className="text-neon" />}
          label={commonGeneral('reset')}
          clickableProps={{ className: 'w-fit' }}
          variant="text"
          colorSchema="gray"
          flat
          onClick={handleChangeNetwork.bind(null, 'mainnet')}
        />
      }
    >
      <p className="mb-7 text-xs">{t('youAreConnectedNeoAndEth')}</p>

      <div className="flex flex-col gap-y-0.5">
        <div className="pb-2.5 text-neon flex gap-x-2 items-center">
          <MdOutlineLanguage className="w-6 h-6" />
          <p className="text-white text-sm">{t('globalConfiguration')}</p>
        </div>

        <Separator className="mb-2.5" />

        <button
          className="text-xs flex items-center justify-between px-1 aria-[disabled=false]:text-gray-300 h-fit hover:opacity-75 rounded"
          onClick={modalNavigateWrapper('network-selection', {
            state: { networkType, onNetworkChange: handleChangeNetwork },
          })}
        >
          <ul className="list-disc list-inside">
            <li className="text-gray-100">{t('currentNetwork')}</li>
          </ul>

          <div className="flex items-center">
            <span className="text-xs text-gray-300 mr-[1.94rem]">{commonT(networkType)}</span>
            <TbChevronRight className="h-6 w-6 text-neon" />
          </div>
        </button>
      </div>
    </SettingsLayout>
  )
}
