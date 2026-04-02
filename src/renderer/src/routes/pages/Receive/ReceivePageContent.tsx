import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

import { ActionStep } from '@renderer/components/ActionStep'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Input } from '@renderer/components/Input'
import { Separator } from '@renderer/components/Separator'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import TbCopy from '@renderer/assets/images/tb-copy.svg?react'
import TbQrcode from '@renderer/assets/images/tb-qrcode.svg?react'
import TbSend from '@renderer/assets/images/tb-send.svg?react'
import TbStepInto from '@renderer/assets/images/tb-step-into.svg?react'

import { TAccount } from '@shared/types/store'

type TProps = {
  account?: TAccount
}

export const ReceivePageContent = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'receive' })

  const [selectedAccount, setSelectedAccount] = useState(account)

  const handleDownload = () => {
    UtilsHelper.downloadSVGToPng('QRCode', selectedAccount?.address)
  }

  return (
    <section className="flex w-full grow flex-col items-center rounded-sm bg-gray-800 py-10 text-xs">
      <div className="flex w-full max-w-lg grow flex-col items-center">
        <ActionStep
          className="rounded-sm bg-gray-700/60 px-4"
          title={t('receivingAccountTitle')}
          leftIcon={<TbStepInto aria-hidden />}
        >
          <GreyAccountSelect onSelect={setSelectedAccount} selectedAccount={selectedAccount} />
        </ActionStep>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedAccount?.address || 'no-account'}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex w-full flex-col items-center rounded-sm bg-gray-700/60 px-3"
          >
            <div className="my-2.5 flex w-full justify-between">
              <div className="flex items-center gap-3">
                <TbStepInto aria-hidden className="text-blue size-5" />
                <span className="font-bold">{t('yourReceivingAddress')}</span>
              </div>

              {!selectedAccount && (
                <div className="flex items-center">
                  <span className="mr-3 text-gray-300">{t('selectAccountToGenerateCode')}</span>
                </div>
              )}
            </div>

            <Separator />

            <Input
              value={selectedAccount?.address || ''}
              compacted
              containerClassName="px-10 mt-4"
              placeholder={t('addressInputHint')}
              readOnly
              copyable={!!selectedAccount?.address}
            />

            <div
              className={StyleHelper.mergeStyles('my-6 rounded-sm border-4', {
                'border-white': selectedAccount?.address,
                'border-gray-700 bg-gray-800 p-4': !selectedAccount?.address,
              })}
            >
              {selectedAccount?.address ? (
                <QRCodeSVG
                  aria-label={selectedAccount.address}
                  id="QRCode"
                  size={172}
                  value={selectedAccount.address}
                  includeMargin
                />
              ) : (
                <TbQrcode aria-hidden className="size-35 text-green-700" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        className="w-[16rem]"
        label={!selectedAccount?.address ? t('sendQRCode') : t('downloadQRCode')}
        leftIcon={!selectedAccount?.address ? <TbSend aria-hidden /> : <TbCopy aria-hidden />}
        disabled={!selectedAccount?.address}
        onClick={handleDownload}
        iconsOnEdge={false}
      />
    </section>
  )
}
