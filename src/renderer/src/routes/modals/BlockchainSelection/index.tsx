import { Fragment } from 'react'

import { useTranslation } from 'react-i18next'

import { BlockchainList } from '@renderer/components/BlockchainList'
import { Button } from '@renderer/components/Button'
import { Separator } from '@renderer/components/Separator'

import { TestHelper } from '@renderer/helpers/TestHelper'

import { useActions } from '@renderer/hooks/useActions'
import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import { TBlockchainServiceKey } from '@shared/types/blockchain'
import type { TModalState } from '@shared/types/modal'

type TActionData = {
  selectedBlockchains: TBlockchainServiceKey[]
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

  const { actionData, setData, handleAct } = useActions<TActionData>({
    selectedBlockchains: ['neo3'],
  })

  const handleSelect = (blockchains: TBlockchainServiceKey[]) => {
    setData({ selectedBlockchains: blockchains })
  }

  const handleSubmit = () => {
    onSelect(actionData.selectedBlockchains)
  }

  return (
    <SideModalLayout heading={heading} headingIcon={headingIcon} contentClassName="flex flex-col pt-4 pb-6">
      {subtitle && (
        <Fragment>
          <p className="text-xs text-gray-100">{subtitle}</p>

          <Separator containerClassName="my-4" />
        </Fragment>
      )}

      {description && <p className="mb-4">{description}</p>}

      <form className="flex grow flex-col" onSubmit={handleAct(handleSubmit)}>
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
          {...TestHelper.buildTestObject('blockchain-selection-submit')}
        />
      </form>
    </SideModalLayout>
  )
}

export default BlockchainSelectionModal
