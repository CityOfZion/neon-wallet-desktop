import { cloneElement } from 'react'
import { MdCheckCircleOutline, MdClose, MdErrorOutline } from 'react-icons/md'
import { Loader } from '@renderer/components/Loader'
import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { toast, Toaster } from 'sonner'

export type TBaseToastProps = {
  message: string
  className?: string
  sonnerId: string | number
  icon?: JSX.Element
  closeable?: boolean
}

const BaseToast = ({ message, className, sonnerId, icon, closeable = true }: TBaseToastProps) => {
  return (
    <div
      className={StyleHelper.mergeStyles(
        'flex p-5 rounded items-center w-[var(--width)] text-sm font-medium gap-5 shadow-lg',
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
      <p className="flex-grow">{message}</p>

      {closeable && (
        <MdClose
          className="w-[1.5rem] h-[1.5rem] min-w-[1.5rem] min-h-[1.5rem] opacity-50 cursor-pointer"
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
