import { Button } from '@renderer/components/Button'

import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import PiWarningLight from '@renderer/assets/images/pi-warning-light.svg?react'

import type { TModalState } from '@shared/types/modal'

const DeleteContactModal = () => {
  const {
    modalTitle,
    warningText,
    warningDescription,
    buttonLabel,
    firstName,
    secondName,
    onButtonClick,
    truncateFirstName = false,
  } = useModalState<TModalState<'delete-contact'>>()
  const { modalNavigate } = useModalNavigate()

  const handleButtonClick = () => {
    onButtonClick()
    modalNavigate(-1)
  }

  const formatFirstName = (text: string) => {
    const minTextLength = 35

    if (!truncateFirstName) return text

    return text.length > minTextLength ? StringHelper.truncateMiddle(text, minTextLength) : text
  }

  return (
    <SideModalLayout heading={modalTitle} headingIcon={<MdDeleteForever aria-hidden className="text-pink" />}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col items-center gap-y-3 text-center text-lg">
          <div className="bg-asphalt flex size-37 items-center justify-center rounded-full">
            <PiWarningLight aria-hidden className="text-pink size-28 px-1" />
          </div>
          <p>{warningText}</p>

          <p className="text-sm text-gray-100">{formatFirstName(firstName)}</p>

          {warningDescription && <p className="text-sm text-gray-300">{warningDescription}</p>}

          {secondName && <p className="text-sm text-gray-100">{secondName}</p>}
        </div>

        <Button
          label={buttonLabel}
          type="button"
          leftIcon={<MdDeleteForever aria-hidden />}
          variant="outlined"
          colorSchema="error"
          flat
          className="w-full"
          onClick={handleButtonClick}
          {...TestHelper.buildTestObject('delete-button')}
        />
      </div>
    </SideModalLayout>
  )
}

export default DeleteContactModal
