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
      <div className="flex flex-col items-center min-h-0 flex-grow">
        <div className="w-28 h-28 p-2 bg-asphalt rounded-full flex items-center">
          <PiSealCheck className="w-24 h-24 text-blue" />
        </div>

        <p className="text-lg text-white mt-7 text-center">{subtitle}</p>

        {content}
      </div>

      {footer}
    </SideModalLayout>
  )
}
