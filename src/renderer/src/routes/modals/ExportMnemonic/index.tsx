import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import PiPrinter from '@renderer/assets/images/pi-printer.svg?react'
import TbCircleKey from '@renderer/assets/images/tb-circle-key.svg?react'
import TbUpload from '@renderer/assets/images/tb-upload.svg?react'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IWalletState } from '@shared/@types/store'

type TLocationState = {
  wallet: IWalletState
}

export const ExportMnemonic = () => {
  const { wallet } = useModalState<TLocationState>()
  const { t } = useTranslation('modals', { keyPrefix: 'exportMnemonic' })
  const { currentLoginSession } = useCurrentLoginSessionSelector()

  const ref = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: ref,
    bodyClass: 'print-agreement',
  })

  if (!currentLoginSession) {
    throw new Error('Login session not defined')
  }

  const words = window.api.sendSync('decryptBasedEncryptedSecretSync', {
    value: wallet.encryptedMnemonic ?? '',
    encryptedSecret: currentLoginSession.encryptedPassword,
  })

  return (
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbUpload aria-hidden={true} />}
      contentClassName="flex flex-col items-center"
    >
      <div className="flex h-[84%] w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col gap-6" ref={ref}>
          <div className="flex h-[34px] items-center justify-center rounded bg-gray-600/15">{wallet.name}</div>
          <div className="text-center text-xs text-gray-100 print:hidden">{t('description')}</div>
          <div className="flex min-h-[6rem] flex-col rounded bg-asphalt p-2">
            <div className="mb-2 flex items-center gap-2">
              <TbCircleKey aria-hidden={true} className="h-5 w-5 text-blue" />
              <span className="text-sm text-white">{t('yourMnemonic')}</span>
            </div>

            <Separator />

            <div className="flex flex-wrap justify-center gap-2 px-10 py-5">
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

            <Button
              iconsOnEdge={false}
              variant="text"
              leftIcon={<PiPrinter />}
              label={t('printButtonLabel')}
              flat
              onClick={() => handlePrint()}
            />
          </div>
          <Banner type="error" message={t('warning')} className="print:hidden" />
        </div>
      </div>
    </SideModalLayout>
  )
}
