import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TbEye, TbReceipt, TbUsers } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { IAccountState } from '@shared/@types/store'

import { TRecipient } from './SendPageContent'

type TProps = {
  selectedAccount: IAccountState
  recipientsHash: { hash: string; recipient: TRecipient }[]
}

export const SuccessModalContent = ({ selectedAccount, recipientsHash }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const navigate = useNavigate()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex flex-col w-full items-center flex-grow justify-between gap-2.5">
      <div className="flex flex-col w-full bg-asphalt px-4 py-3 rounded mt-6 ">
        <div className="flex justify-between text-sm text-white items-center">
          <div className="flex items-center gap-2.5">
            <TbReceipt className="text-blue w-6 h-6" />
            <span>{t('detailsTitle')}</span>
          </div>
        </div>

        <Separator className="mt-2.5" />

        {recipientsHash.map((recipient: { hash: string; recipient: TRecipient }, index: number) => (
          <div className="flex flex-col mt-5 gap-2.5 items-start" key={index}>
            <div className="w-full text-blue bg-gray-300/15 p-2">Transaction {index + 1}</div>

            <div className="px-1.5 flex flex-col gap-2">
              <div className="flex w-full justify-between items-center">
                <span className="text-gray-100 text-xs uppercase">Recipient</span>
              </div>

              <div className="flex gap-6 w-full items-center">
                <span className="text-sm text-white break-all w-full">{recipient.recipient.selectedRecipient}</span>
                <IconButton
                  icon={<MdOutlineContentCopy className="text-neon" />}
                  size="md"
                  onClick={() => UtilsHelper.copyToClipboard(recipient.recipient.selectedRecipient!)}
                />
              </div>

              <Button
                className="w-fit"
                label={t('saveContactButtonLabel')}
                variant="text-slim"
                flat
                leftIcon={<TbUsers />}
                iconsOnEdge={false}
                onClick={modalNavigateWrapper('persist-contact', {
                  state: {
                    addresses: [
                      { address: recipient.recipient.selectedRecipient, blockchain: selectedAccount.blockchain },
                    ],
                  },
                })}
              />
            </div>

            <Separator className="mt-2" />

            <div className="px-1.5 flex flex-col gap-2">
              <div className="flex w-full justify-between items-center">
                <span className="text-gray-100 text-xs uppercase">Amount</span>
              </div>

              <span>
                {recipient.recipient.selectedAmount} {recipient.recipient.selectedToken!.token.symbol}
              </span>
            </div>

            <Separator className="mt-2" />

            <div className="flex flex-col mt-4.5 gap-2 items-start px-1.5">
              <span className="text-gray-100 text-xs uppercase">{t('transactionHashLabel')}</span>

              <div className="flex gap-6 w-full items-center">
                {recipient.hash && (
                  <>
                    <span className="text-sm text-white break-all">{recipient.hash}</span>
                    <IconButton
                      icon={<MdOutlineContentCopy className="text-neon" />}
                      size="md"
                      onClick={() => UtilsHelper.copyToClipboard(recipient.hash)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full max-w-[15.625rem]"
        label={t('viewStatusButtonLabel')}
        rightIcon={<TbEye />}
        iconsOnEdge={false}
        onClick={() => {
          modalNavigate(-1)
          navigate(`/app/wallets/${selectedAccount.id}/transactions`)
        }}
      />
    </div>
  )
}
