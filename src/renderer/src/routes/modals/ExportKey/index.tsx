import { useRef } from 'react'

import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useCurrentLoginSessionSelector } from '@renderer/hooks/useAuthSelector'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import MdOutlinePrint from '@renderer/assets/images/md-outline-print.svg?react'
import TbReceipt from '@renderer/assets/images/tb-receipt.svg?react'
import TbUpload from '@renderer/assets/images/tb-upload.svg?react'

import { IAccountState } from '@shared/@types/store'

type TLocationState = {
  account: IAccountState
}

const ExportKeyModal = () => {
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
      headingIcon={<TbUpload aria-hidden />}
      contentClassName="flex flex-col items-center"
    >
      <div className="flex min-h-8 w-full justify-center rounded-sm bg-gray-300/15 px-3">
        <p className="p-2 text-center text-xs">{StringHelper.truncateStringMiddle(account.name, 45)}</p>
      </div>

      <span className="px-9 pt-4 text-center text-xs text-gray-100">{t('subtitle')}</span>
      <div className="border-asphalt mt-8 flex justify-center rounded-md border-4">
        <div ref={ref} className="overflow-hidden rounded-sm">
          <QRCodeSVG id="QRCode" size={174} value={decryptedKey} includeMargin />
        </div>
      </div>

      <Separator className="my-8" />

      <div className="flex w-full min-w-[200px] flex-col overflow-hidden rounded-sm bg-gray-900 px-3 py-2.5 text-sm">
        <div className="mb-2.5 flex items-center gap-x-2">
          <TbReceipt aria-hidden className="text-blue h-6 w-6" />

          <div className="text-sm">{t('keyDetailsTitle')}</div>
        </div>

        <Separator />

        <div className="flex flex-col">
          <span className="px-3 pt-8 pb-6 text-wrap break-all">{decryptedKey}</span>
        </div>
      </div>

      <div className="mt-2.5 flex">
        <Button
          variant="text"
          leftIcon={<MdContentCopy aria-hidden />}
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

export default ExportKeyModal
