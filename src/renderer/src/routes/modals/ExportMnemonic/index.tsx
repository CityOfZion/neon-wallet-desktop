import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdContentCopy } from 'react-icons/md'
import { PiPrinter } from 'react-icons/pi'
import { TbCircleKey, TbUpload } from 'react-icons/tb'
import ReactToPrint from 'react-to-print'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { useEncryptedPasswordSelector } from '@renderer/hooks/useSettingsSelector'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IWalletState } from '@shared/@types/store'

type TLocationState = {
  wallet: IWalletState
}

export const ExportMnemonic = () => {
  const { wallet } = useModalState<TLocationState>()
  const { t } = useTranslation('modals', { keyPrefix: 'exportMnemonic' })
  const ref = useRef<HTMLDivElement>(null)
  const { encryptedPassword } = useEncryptedPasswordSelector()

  const words = window.api.sendSync('decryptBasedEncryptedSecretSync', {
    value: wallet.encryptedMnemonic ?? '',
    encryptedSecret: encryptedPassword,
  })

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbUpload />} contentClassName="flex flex-col items-center">
      <div className="flex flex-col items-center w-full h-[84%] justify-between">
        <div className="flex flex-col w-full gap-6" ref={ref}>
          <div className="bg-gray-600/15 h-[34px] flex items-center justify-center rounded">{wallet.name}</div>
          <div className="text-gray-100 text-xs text-center print:hidden">{t('description')}</div>
          <div className="min-h-[6rem] rounded bg-asphalt flex flex-col p-2">
            <div className="flex gap-2 items-center mb-2">
              <TbCircleKey className="text-blue h-5 w-5" />
              <span className="text-sm text-white">{t('yourMnemonic')}</span>
            </div>

            <Separator />

            <div className="flex flex-wrap px-10 py-5 gap-2 justify-center">
              {words.split(' ').map((word, index) => (
                <span className="text-lg text-white" key={index}>
                  {word}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-3 print:hidden">
            <Button
              iconsOnEdge={false}
              variant="text"
              leftIcon={<MdContentCopy />}
              label={t('copyButtonLabel')}
              onClick={() => UtilsHelper.copyToClipboard(words)}
              flat
            />
            <ReactToPrint
              bodyClass="print-agreement"
              content={() => ref.current}
              trigger={() => (
                <Button
                  iconsOnEdge={false}
                  variant="text"
                  leftIcon={<PiPrinter />}
                  label={t('printButtonLabel')}
                  flat
                />
              )}
            />
          </div>
          <Banner type="error" message={t('warning')} className="print:hidden" />
        </div>
      </div>
    </SideModalLayout>
  )
}
