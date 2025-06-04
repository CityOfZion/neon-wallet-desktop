import { MdCancel } from 'react-icons/md'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TState = {
  heading: string
  headingIcon?: JSX.Element
  subtitle?: string
  description?: string
  content: JSX.Element
}

export const ErrorModal = () => {
  const { heading, headingIcon, content, subtitle, description } = useModalState<TState>()

  return (
    <SideModalLayout
      heading={heading}
      headingIcon={headingIcon}
      contentClassName="flex flex-col flex-grow items-center justify-center min-w-0"
    >
      <div className="flex h-28 w-28 items-center rounded-full bg-asphalt p-2">
        <MdCancel aria-hidden={true} className="h-24 w-24 text-pink" />
      </div>

      {subtitle && <p className="mt-7 text-lg text-white">{subtitle}</p>}
      {description && <p className="mt-2 text-xs text-gray-300">{description}</p>}

      {content}
    </SideModalLayout>
  )
}
