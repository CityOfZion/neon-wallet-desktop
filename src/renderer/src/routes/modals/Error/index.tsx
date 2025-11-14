import { useModalState } from '@renderer/hooks/useModalRouter'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import MdCancel from '@renderer/assets/images/md-cancel.svg?react'

import type { TModalState } from '@shared/types/modal'

const ErrorModal = () => {
  const { heading, headingIcon, content, subtitle, description } = useModalState<TModalState<'error'>>()

  return (
    <SideModalLayout
      heading={heading}
      headingIcon={headingIcon}
      contentClassName="flex flex-col grow items-center justify-center min-w-0"
      size="md"
    >
      <div className="bg-asphalt flex h-28 w-28 items-center rounded-full p-2">
        <MdCancel aria-hidden className="text-pink h-24 w-24" />
      </div>

      {subtitle && <p className="mt-7 text-lg text-white">{subtitle}</p>}
      {description && <p className="mt-2 text-xs text-gray-300">{description}</p>}

      {content}
    </SideModalLayout>
  )
}

export default ErrorModal
