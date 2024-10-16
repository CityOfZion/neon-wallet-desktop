import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { Button } from '@renderer/components/Button'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useModalNavigate } from '@renderer/hooks/useModalRouter'
import { IAccountState } from '@shared/@types/store'

import { ActionStep } from './ActionStep'

type TAccountParams = {
  selectedAccount?: IAccountState
  onSelectAccount: (contact: IAccountState) => void
  active: boolean
  title: string
  modalTitle: string
  modalButtonLabel: string
  leftIcon?: JSX.Element
}

export const SelectAccountStep = ({
  selectedAccount,
  onSelectAccount,
  active,
  title,
  modalTitle,
  modalButtonLabel,
  leftIcon,
}: TAccountParams) => {
  const { t } = useTranslation('pages', { keyPrefix: 'selectAccount' })
  const { modalNavigateWrapper } = useModalNavigate()

  return (
    <ActionStep title={title} leftIcon={leftIcon} className="bg-gray-700/60 rounded">
      <Button
        className="flex items-center"
        onClick={modalNavigateWrapper('select-account', {
          state: {
            onSelectAccount,
            title: modalTitle,
            buttonLabel: modalButtonLabel,
            leftIcon,
          },
        })}
        variant="text"
        clickableProps={{
          className: 'text-sm pl-3 pr-1',
        }}
        colorSchema={active ? 'neon' : 'white'}
        label={selectedAccount ? StringHelper.truncateString(selectedAccount.name, 40) : t('selectAccount')}
        rightIcon={<TbChevronRight />}
        flat
      />
    </ActionStep>
  )
}
