import { PiSealCheck } from 'react-icons/pi'
import { useModalState } from '@renderer/hooks/useModalRouter'
import { SideModalLayout } from '@renderer/layouts/SideModal'

type TState = {
  heading: string
  headingIcon?: JSX.Element
  subtitle?: string
  content?: JSX.Element
  footer?: JSX.Element
}

export const SuccessModal = () => {
  const { heading, headingIcon, content, subtitle, footer } = useModalState<TState>()

  return (
    <SideModalLayout heading={heading} headingIcon={headingIcon} contentClassName="flex flex-col">
      <div className="flex min-h-0 flex-grow flex-col items-center">
        <div className="flex h-28 w-28 items-center rounded-full bg-asphalt p-2">
          <PiSealCheck aria-hidden={true} className="h-24 w-24 text-blue" />
        </div>

        <p className="mt-7 text-center text-lg text-white">{subtitle}</p>

        {content}
      </div>

      {footer}
    </SideModalLayout>
  )
}
