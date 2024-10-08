import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { VscCircleFilled } from 'react-icons/vsc'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { Button } from '@renderer/components/Button'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { TTokenBalance } from '@shared/@types/query'
import { IAccountState } from '@shared/@types/store'

type TTokenParams = {
  selectedAccount?: IAccountState
  selectedToken?: TTokenBalance
  onSelectToken?: (token: TTokenBalance) => void
  active: boolean
}

export const SelectToken = ({ selectedAccount, selectedToken, onSelectToken, active }: TTokenParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'send' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <div className="flex justify-between my-1">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <VscCircleFilled className="text-gray-300 w-2 h-2" />
        </div>

        <span
          className={StyleHelper.mergeStyles({
            'font-bold': active,
          })}
        >
          {t('tokenToSend')}
        </span>
      </div>

      <Button
        className="flex items-center"
        onClick={modalNavigateWrapper('select-token', {
          state: {
            selectedAccount: selectedAccount,
            onSelectToken: onSelectToken,
          },
        })}
        variant="text"
        colorSchema={active ? 'neon' : 'white'}
        disabled={selectedAccount ? false : true}
        clickableProps={{
          className: 'text-sm pl-3 pr-1',
        }}
        label={selectedToken ? StringHelper.truncateString(selectedToken.token.symbol, 4) : t('selectToken')}
        leftIcon={
          selectedToken ? (
            <div className="rounded-lg bg-gray-300 w-4.5 h-4.5 flex justify-center items-center">
              <BlockchainIcon blockchain={selectedToken.blockchain} type="white" className="w-2.5 h-2.5" />
            </div>
          ) : undefined
        }
        rightIcon={<TbChevronRight />}
        flat
      />
    </div>
  )
}
