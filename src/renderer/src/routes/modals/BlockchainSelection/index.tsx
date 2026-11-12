import { Fragment } from 'react'

import { BSUtilsHelper } from '@cityofzion/blockchain-service'
import type { TBSServiceName } from '@cityofzion/bs-multichain'
import { useTranslation } from 'react-i18next'

import { BlockchainList } from '@renderer/components/BlockchainList'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { BlockchainServiceHelper } from '@renderer/helpers/BlockchainServiceHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import type { TModalState } from '@shared/types/modal'

type TActionData = {
  selectedBlockchains: TBSServiceName[]
}

const BlockchainSelectionModal = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'blockchainSelection' })
  const {
    heading,
    headingIcon,
    description,
    buttonLabel,
    onSelect,
    subtitle,
    isMulti = false,
  } = useModalState<TModalState<'blockchain-selection'>>()

  const { actionData, setData, handleAct, actionState } = useActions<TActionData>({
    selectedBlockchains: ['neo3'],
  })

  const handleSelect = (blockchains: TBSServiceName[]) => {
    setData({ selectedBlockchains: blockchains })
  }

  const areAllBlockchainsSelected = BlockchainServiceHelper.blockchainNames.every(blockchain =>
    actionData.selectedBlockchains.includes(blockchain)
  )

  const handleToggleAllBlockchains = () => {
    setData({ selectedBlockchains: areAllBlockchainsSelected ? [] : BlockchainServiceHelper.blockchainNames })
  }

  const handleSubmit = async () => {
    await onSelect(actionData.selectedBlockchains)

    await BSUtilsHelper.wait(1000)
  }

  return (
    <SideModalLayout heading={heading} headingIcon={headingIcon} contentClassName="flex flex-col">
      {subtitle && (
        <Fragment>
          <p className="text-xs text-gray-100">{subtitle}</p>

          <Separator className="my-7" />
        </Fragment>
      )}

      <p>{description}</p>

      <form className="mt-6 flex grow flex-col" onSubmit={handleAct(handleSubmit)}>
        {isMulti && (
          <div className="flex justify-end pr-2 pb-3">
            <Button
              label={areAllBlockchainsSelected ? t('deselectAllButtonLabel') : t('selectAllButtonLabel')}
              type="button"
              variant="text-slim"
              flat
              onClick={handleToggleAllBlockchains}
            />
          </div>
        )}

        <BlockchainList
          selectedBlockchains={actionData.selectedBlockchains}
          onSelect={handleSelect}
          isMulti={isMulti}
          className="mb-0 h-0 min-h-0 w-full grow"
        />

        <Button
          className="mt-8"
          type="submit"
          label={buttonLabel || t('buttonContinueLabel')}
          flat
          disabled={actionData.selectedBlockchains.length === 0}
          loading={actionState.isActing}
          {...TestHelper.buildTestObject('blockchain-selection-submit')}
        />
      </form>
    </SideModalLayout>
  )
}

export default BlockchainSelectionModal
