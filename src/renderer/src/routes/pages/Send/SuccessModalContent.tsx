import { useTranslation } from 'react-i18next'
import { TbEye, TbUsers } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { IAccountState } from '@renderer/@types/store'
import { Button } from '@renderer/components/Button'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'

type TProps = {
  selectedAccount: IAccountState
  selectedRecipientAddress: string
}

export const SuccessModalContent = ({ selectedAccount, selectedRecipientAddress }: TProps) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const navigate = useNavigate()
  const { modalNavigate, modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex w-full mt-auto gap-2.5">
      <Button
        className="w-full"
        label={t('saveContact')}
        colorSchema="gray"
        leftIcon={<TbUsers />}
        iconsOnEdge={false}
        onClick={modalNavigateWrapper('persist-contact', {
          state: { addresses: [{ address: selectedRecipientAddress, blockchain: selectedAccount.blockchain }] },
        })}
      />

      <Button
        className="w-full"
        label={t('viewStatus')}
        leftIcon={<TbEye />}
        iconsOnEdge={false}
        onClick={() => {
          modalNavigate(-1)
          navigate(`/app/wallets/${selectedAccount.address}/transactions`)
        }}
      />
    </div>
  )
}
