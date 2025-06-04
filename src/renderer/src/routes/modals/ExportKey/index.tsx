import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MdContentCopy, MdOutlinePrint } from 'react-icons/md'
import { TbReceipt, TbUpload } from 'react-icons/tb'
import { useReactToPrint } from 'react-to-print'
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
  const handlePrint = useReactToPrint({
    contentRef: ref,
    bodyClass: 'print-agreement',
  })

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
    <SideModalLayout
      heading={t('title')}
      headingIcon={<TbUpload aria-hidden={true} />}
      contentClassName="flex flex-col items-center"
    >
      <div className="flex min-h-[2rem] w-full justify-center rounded bg-gray-300/15 px-3">
        <p className="p-2 text-center text-xs">{StringHelper.truncateStringMiddle(account.name, 45)}</p>
      </div>

      <span className="px-9 pt-4 text-center text-xs text-gray-100">{t('subtitle')}</span>
      <div className="mt-8 flex justify-center rounded-md border-4 border-asphalt">
        <div ref={ref} className="overflow-hidden rounded">
          <QRCodeSVG id="QRCode" size={174} value={decryptedKey} includeMargin />
        </div>
      </div>

      <Separator className="my-8" />

      <div className="flex w-full min-w-[200px] flex-col overflow-hidden rounded bg-gray-900 px-3 py-2.5 text-sm">
        <div className="mb-2.5 flex items-center gap-x-2">
          <TbReceipt aria-hidden={true} className="h-6 w-6 text-blue" />

          <div className="text-sm">{t('keyDetailsTitle')}</div>
        </div>

        <Separator />

        <div className="flex flex-col">
          <span className="text-wrap break-all px-3 pb-6 pt-8">{decryptedKey}</span>
        </div>
      </div>

      <div className="mt-2.5 flex">
        <Button
          variant="text"
          leftIcon={<MdContentCopy aria-hidden={true} />}
          label={t('copyButtonLabel')}
          onClick={handleCopy}
          clickableProps={{ className: 'px-4' }}
          flat
        />

        <Button
          variant="text"
          leftIcon={<MdOutlinePrint />}
          label={t('printButtonLabel')}
          clickableProps={{ className: 'px-4' }}
          flat
          onClick={() => handlePrint()}
        />
      </div>

      <Banner className="mt-5" type="warningOrange" textClassName="py-4" message={t('warningDescription')} />
    </SideModalLayout>
  )
}
