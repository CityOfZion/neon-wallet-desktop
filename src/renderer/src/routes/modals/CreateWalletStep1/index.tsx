import { useMemo, useRef } from 'react'

import { BSKeychainHelper } from '@cityofzion/blockchain-service'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import { Banner } from '@renderer/components/Banner'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { TestHelper } from '@renderer/helpers/TestHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import { useModalNavigate } from '@renderer/hooks/useModalRouter'

import { CreateWalletModalLayout } from '@renderer/layouts/CreateWalletModalLayout'

import MdContentCopy from '@renderer/assets/images/md-content-copy.svg?react'
import MdLooksOne from '@renderer/assets/images/md-looks-one.svg?react'
import PiPrinter from '@renderer/assets/images/pi-printer.svg?react'

const CreateWalletStep1Modal = () => {
  const ref = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({ contentRef: ref, bodyClass: 'print-agreement' })
  const { t } = useTranslation('modals', { keyPrefix: 'createWallet.step1' })
  const { modalNavigate } = useModalNavigate()

  const words = useMemo(() => {
    return BSKeychainHelper.generateMnemonic().split(' ')
  }, [])

  return (
    <CreateWalletModalLayout {...TestHelper.buildTestObject('create-wallet-step1-modal')}>
      <header className="flex items-center justify-between py-2.5 print:hidden">
        <div className="flex items-center gap-x-2.5">
          <MdLooksOne aria-hidden className="text-blue h-4.5 w-4.5" />
          <h2 className="text-sm">{t('title')}</h2>
        </div>
        <div className="text-blue text-sm">{t('step1of4')}</div>
      </header>

      <Separator className="mb-9 min-h-px" />

      <div className="flex h-[84%] w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col gap-6" ref={ref}>
          <div className="text-xs text-gray-100 print:hidden">{t('description')}</div>
          <div className="bg-asphalt mx-5 flex min-h-24 flex-wrap justify-center gap-x-4 gap-y-2 rounded-sm px-10 py-5">
            {words.map((word, index) => (
              <span className="text-lg text-white" key={word}>
                {index + 1}. {word}
              </span>
            ))}
          </div>

          <div className="flex justify-center gap-3 print:hidden">
            <Button
              iconsOnEdge={false}
              variant="text"
              leftIcon={<MdContentCopy aria-hidden />}
              label={t('copyButtonLabel')}
              onClick={() => UtilsHelper.copyToClipboard(words.join(' '))}
              flat
            />

            <Button
              iconsOnEdge={false}
              variant="text"
              leftIcon={<PiPrinter aria-hidden />}
              label={t('printButtonLabel')}
              flat
              onClick={() => handlePrint()}
            />
          </div>
          <Banner type="error" message={t('warning')} className="mx-10 print:hidden" />
        </div>

        <div className="flex gap-2">
          <Button label={t('backButtonLabel')} colorSchema="gray" flat disabled wide />

          <Button
            className="w-48 print:hidden"
            label={t('nextButtonLabel')}
            flat
            onClick={() => modalNavigate('create-wallet-step-2', { state: { words } })}
          />
        </div>
      </div>
    </CreateWalletModalLayout>
  )
}

export default CreateWalletStep1Modal
