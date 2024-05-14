import { useTranslation } from 'react-i18next'
import { MdOutlineContentCopy } from 'react-icons/md'
import { TbEye, TbReceipt, TbUsers } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { TokenBalance } from '@renderer/@types/query'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { IconButton } from '@renderer/components/IconButton'
import { Separator } from '@renderer/components/Separator'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  selectedAccount: IAccountState
  selectedRecipientAddress: string
  selectedAmount: string
  selectedToken: TokenBalance
  transactionHash: string
}

export const SuccessModalContent = ({
  selectedAccount,
  selectedRecipientAddress,
  selectedAmount,
  selectedToken,
  transactionHash,
}: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send.sendSuccess' })
  const navigate = useNavigate()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex flex-col w-full items-center flex-grow justify-between">
      <div className="flex flex-col w-full bg-asphalt px-4 py-3 rounded mt-6">
        <div className="flex justify-between text-sm text-white items-center">
          <div className="flex items-center gap-2.5">
            <TbReceipt className="text-blue w-6 h-6" />
            <span>{t('detailsTitle')}</span>
          </div>

          <span className="font-bold">
            {selectedAmount} {selectedToken.token.symbol}
          </span>
        </div>

        <Separator className="mt-2.5" />

        <div className="flex flex-col mt-4.5 gap-2.5 items-start">
          <span className="text-gray-100 text-xs uppercase">{t('addressLabel')}</span>

          <div className="flex gap-6 w-full items-center">
            <span className="text-sm text-white break-all">{selectedRecipientAddress}</span>
            <IconButton
              icon={<MdOutlineContentCopy className="text-neon" />}
              size="md"
              onClick={() => UtilsHelper.copyToClipboard(selectedRecipientAddress)}
            />
          </div>

          <Button
            label={t('saveContactButtonLabel')}
            variant="text"
            flat
            leftIcon={<TbUsers />}
            iconsOnEdge={false}
            onClick={modalNavigateWrapper('persist-contact', {
              state: { addresses: [{ address: selectedRecipientAddress, blockchain: selectedAccount.blockchain }] },
            })}
          />
        </div>

        <Separator className="mt-3" />

        <div className="flex flex-col mt-4.5 gap-3 items-start">
          <span className="text-gray-100 text-xs uppercase">{t('transactionHashLabel')}</span>

          <div className="flex gap-6 w-full items-center">
            <span className="text-sm text-white break-all">{transactionHash}</span>
            <IconButton
              icon={<MdOutlineContentCopy className="text-neon" />}
              size="md"
              onClick={() => UtilsHelper.copyToClipboard(transactionHash)}
            />
          </div>
        </div>
      </div>

      <Button
        className="w-full max-w-[15.625rem]"
        label={t('viewStatusButtonLabel')}
        rightIcon={<TbEye />}
        iconsOnEdge={false}
        onClick={() => {
          modalNavigate(-1)
          navigate(`/app/wallets/${selectedAccount.address}/transactions`)
        }}
      />
    </div>
  )
}
