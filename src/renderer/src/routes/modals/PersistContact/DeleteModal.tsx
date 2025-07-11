import MdDeleteForever from '@renderer/assets/images/md-delete-forever.svg?react'
import PiWarningLight from '@renderer/assets/images/pi-warning-light.svg?react'
import { Button } from '@renderer/components/Button'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TLocationState = {
  modalTitle: string
  warningText: string
  warningDescription?: string
  firstName: string
  secondName?: string
  onButtonClick: () => void
  buttonLabel: string
  truncateFirstName?: boolean
}

export const DeleteModal = () => {
  const {
    modalTitle,
    warningText,
    warningDescription,
    buttonLabel,
    firstName,
    secondName,
    onButtonClick,
    truncateFirstName = false,
  } = useModalState<TLocationState>()
  const { modalNavigate } = useModalNavigate()

  const handleButtonClick = () => {
    onButtonClick()
    modalNavigate(-1)
  }

  const formatFirstName = (text: string) => {
    const minTextLength = 35

    if (!truncateFirstName) return text

    return text.length > minTextLength ? StringHelper.truncateStringMiddle(text, minTextLength) : text
  }

  return (
    <SideModalLayout heading={modalTitle} headingIcon={<MdDeleteForever aria-hidden={true} className="text-pink" />}>
      <div className="flex h-full flex-col justify-between">
        <div className="ga´p-y-6 flex flex-col items-center text-center text-lg">
          <div className="flex h-[9.25rem] w-[9.25rem] items-center justify-center rounded-full bg-asphalt">
            <PiWarningLight aria-hidden={true} className="h-28 w-28 px-1 text-pink" />
          </div>
          <p>{warningText}</p>

          <p className="text-sm text-gray-100">{formatFirstName(firstName)}</p>

          {warningDescription && <p className="text-sm text-gray-300">{warningDescription}</p>}

          {secondName && <p className="text-sm text-gray-100">{secondName}</p>}
        </div>

        <Button
          label={buttonLabel}
          type="button"
          leftIcon={<MdDeleteForever />}
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
