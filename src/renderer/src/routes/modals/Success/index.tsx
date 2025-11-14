import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import PiSealCheck from '@renderer/assets/images/pi-seal-check.svg?react'

import type { TModalState } from '@shared/types/modal'

const SuccessModal = () => {
  const { heading, headingIcon, content, subtitle, footer } = useModalState<TModalState<'success'>>()

  return (
    <SideModalLayout heading={heading} headingIcon={headingIcon} contentClassName="flex flex-col" size="md">
      <div className="flex min-h-0 grow flex-col items-center">
        <div className="bg-asphalt flex h-28 w-28 items-center rounded-full p-2">
          <PiSealCheck aria-hidden className="text-blue h-24 w-24" />
        </div>

        <p className="mt-7 text-center text-lg text-white">{subtitle}</p>

        {content}
      </div>

      {footer}
    </SideModalLayout>
  )
}

export default SuccessModal
