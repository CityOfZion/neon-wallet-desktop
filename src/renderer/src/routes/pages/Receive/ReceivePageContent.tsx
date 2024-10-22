import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCopy, TbQrcode, TbSend, TbStepInto } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { Input } from '@renderer/components/Input'
import { SelectAccountStep } from '@renderer/components/SelectAccountStep'
import { Separator } from '@renderer/components/Separator'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { IAccountState } from '@shared/@types/store'
import { QRCodeSVG } from 'qrcode.react'

type TProps = {
  account?: IAccountState
}

export const ReceiveYourAddressContent = ({ account }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'receive' })

  const [selectedAccount, setSelectedAccount] = useState(account)

  const handleDownload = () => {
    UtilsHelper.downloadSVGToPng('QRCode', selectedAccount?.address)
  }

  return (
    <section className="bg-gray-800 w-full flex-grow flex flex-col rounded text-xs items-center py-10">
      <div className="max-w-[32rem] w-full flex flex-col items-center flex-grow">
        <SelectAccountStep
          selectedAccount={selectedAccount}
          onSelectAccount={setSelectedAccount}
          active
          title={t('receivingAccountTitle')}
          modalTitle={t('selectAccountModal.title')}
          modalButtonLabel={t('selectAccountModal.selectReceivingAccount')}
          leftIcon={<TbStepInto className="text-neon" />}
        />

        <div className="bg-gray-700/60 flex flex-col rounded px-3 mt-2 w-full items-center">
          <div className="flex justify-between my-2.5 w-full">
            <div className="flex items-center gap-3">
              <TbStepInto className="text-blue w-5 h-5" />
              <span className="font-bold">{t('yourReceivingAddress')}</span>
            </div>

            {!selectedAccount && (
              <div className="flex items-center">
                <span className="text-gray-300 mr-3">{t('selectAccountToGenerateCode')}</span>
              </div>
            )}
          </div>

          <Separator />

          <Input
            value={selectedAccount?.address ?? ''}
            compacted
            containerClassName="px-10 mt-4"
            placeholder={t('addressInputHint')}
            readOnly
            copyable={!!selectedAccount?.address}
          />

          <div
            className={StyleHelper.mergeStyles('border-4 rounded my-6', {
              'border-white': selectedAccount?.address,
              'border-gray-700 bg-gray-800 p-4': !selectedAccount?.address,
            })}
          >
            {selectedAccount?.address ? (
              <QRCodeSVG id="QRCode" size={172} value={selectedAccount?.address} includeMargin />
            ) : (
              <TbQrcode className="text-green-700 w-[140px] h-[140px]" />
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-[16rem]"
        label={!selectedAccount?.address ? t('sendQRCode') : t('downloadQRCode')}
        leftIcon={!selectedAccount?.address ? <TbSend /> : <TbCopy />}
        disabled={!selectedAccount?.address}
        onClick={handleDownload}
        iconsOnEdge={false}
      />
    </section>
  )
}
