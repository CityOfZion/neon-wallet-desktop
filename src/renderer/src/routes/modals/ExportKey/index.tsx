import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdContentCopy, MdOutlinePrint } from 'react-icons/md'
import { TbReceipt, TbUpload } from 'react-icons/tb'
import ReactToPrint from 'react-to-print'
import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'
import { IAccountState } from '@shared/@types/store'
import { QRCodeSVG } from 'qrcode.react'

type TLocationState = {
  account: IAccountState
}

export const ExportKeyModal = () => {
  const { account } = useModalState<TLocationState>()
  const { currentLoginSession } = useCurrentLoginSessionSelector()
  const { t } = useTranslation('modals', { keyPrefix: 'exportKey' })
  const ref = useRef<HTMLDivElement>(null)

  if (!currentLoginSession) {
    throw new Error('Login session not defined')
  }

  const decryptedKey = window.api.sendSync('decryptBasedEncryptedSecretSync', {
    value: account.encryptedKey ?? '',
    encryptedSecret: currentLoginSession.encryptedPassword,
  })

  const handleCopy = () => {
    UtilsHelper.copyToClipboard(decryptedKey)
  }

  return (
    <SideModalLayout heading={t('title')} headingIcon={<TbUpload />} contentClassName="flex flex-col items-center">
      <div className="flex w-full px-3 bg-gray-300/15 rounded min-h-[2rem] justify-center">
        <p className="text-center text-xs p-2">{StringHelper.truncateStringMiddle(account.name, 45)}</p>
      </div>

      <span className="text-center px-9 text-xs text-gray-100 pt-4">{t('subtitle')}</span>
      <div className="flex rounded-md justify-center mt-8 border-asphalt border-4">
        <div ref={ref} className="rounded overflow-hidden">
          <QRCodeSVG id="QRCode" size={174} value={decryptedKey} includeMargin />
        </div>
      </div>

      <Separator className="my-8" />

      <div className="min-w-[200px] w-full flex flex-col bg-gray-900 rounded py-2.5 px-3 text-sm overflow-hidden">
        <div className="flex items-center gap-x-2 mb-2.5">
          <TbReceipt className="w-6 h-6 text-blue" />

          <div className="text-sm">{t('keyDetailsTitle')}</div>
        </div>

        <Separator />

        <div className="flex flex-col">
          <span className="pt-8 pb-6 px-3 text-wrap break-all">{decryptedKey}</span>
        </div>
      </div>

      <div className="flex mt-2.5">
        <Button
          variant="text"
          leftIcon={<MdContentCopy />}
          label={t('copyButtonLabel')}
          onClick={handleCopy}
          clickableProps={{ className: 'px-4' }}
          flat
        />
        <ReactToPrint
          bodyClass="print-agreement"
          content={() => ref.current}
          trigger={() => (
            <Button
              variant="text"
              leftIcon={<MdOutlinePrint />}
              label={t('printButtonLabel')}
              clickableProps={{ className: 'px-4' }}
              flat
            />
          )}
        />
      </div>

      <Banner className="mt-5" type="warningOrange" textClassName="py-4" message={t('warningDescription')} />
    </SideModalLayout>
  )
}
