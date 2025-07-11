import { cloneElement, ReactNode } from 'react'
import MdCheckCircleOutline from '@renderer/assets/images/md-check-circle-outline.svg?react'
import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdErrorOutline from '@renderer/assets/images/md-error-outline.svg?react'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { toast, Toaster } from 'sonner'

export type TBaseToastProps = {
  message: ReactNode
  className?: string
  sonnerId: string | number
  icon?: JSX.Element
  closeable?: boolean
}

const BaseToast = ({ message, className, sonnerId, icon, closeable = true }: TBaseToastProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex w-[var(--width)] items-center gap-5 rounded p-5 text-sm font-medium shadow-lg',
        className
      )}
      {...TestHelper.buildTestObject('toast')}
    >
      {icon &&
        cloneElement(icon, {
          className: StyleHelper.mergeStyles(
            'w-[1.5rem] h-[1.5rem] min-w-[1.5rem] min-h-[1.5rem]',
            icon.props.className
          ),
        })}

      <div className="flex-grow">{message}</div>

      {closeable && (
        <MdClose
          aria-hidden={true}
          className="h-[1.5rem] min-h-[1.5rem] w-[1.5rem] min-w-[1.5rem] cursor-pointer opacity-50"
          onClick={() => toast.dismiss(sonnerId)}
        />
      )}
    </div>
  )
}

export const SuccessToast = ({ message, sonnerId }: Pick<TBaseToastProps, 'message' | 'sonnerId'>) => {
  return (
    <BaseToast
      className="bg-green-700 text-neon"
      message={message}
      sonnerId={sonnerId}
      icon={<MdCheckCircleOutline />}
    />
  )
}

export const ErrorToast = ({ message, sonnerId }: Pick<TBaseToastProps, 'message' | 'sonnerId'>) => {
  return (
    <BaseToast
      className="bg-pink-700 text-white"
      message={message}
      sonnerId={sonnerId}
      icon={<MdErrorOutline className="text-magenta" />}
    />
  )
}

export const InfoToast = ({ message, sonnerId }: Pick<TBaseToastProps, 'message' | 'sonnerId'>) => {
  return (
    <BaseToast
      className="bg-orange text-white"
      message={message}
      sonnerId={sonnerId}
      icon={<MdErrorOutline className="text-white" />}
    />
  )
}

export const PromiseToast = ({ message, sonnerId }: Pick<TBaseToastProps, 'message' | 'sonnerId'>) => {
  return (
    <BaseToast
      className="bg-orange text-white"
      message={message}
      sonnerId={sonnerId}
      icon={<Loader containerClassName="w-min" />}
      closeable={false}
    />
  )
}

export const ToastProvider = () => <Toaster position="bottom-center" expand gap={10} />
