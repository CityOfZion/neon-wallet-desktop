'use client'

import { cloneElement, type JSX, ReactNode } from 'react'

import { toast, Toaster } from 'sonner'

import { Loader } from '@renderer/components/Loader'

import { StyleHelper } from '@renderer/helpers/StyleHelper'
import { TestHelper } from '@renderer/helpers/TestHelper'

import MdCheckCircleOutline from '@renderer/assets/images/md-check-circle-outline.svg?react'
import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdErrorOutline from '@renderer/assets/images/md-error-outline.svg?react'

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
        'flex w-(--width) items-center gap-5 rounded-sm p-5 text-sm font-medium shadow-lg',
        className
      )}
      {...TestHelper.buildTestObject('toast')}
    >
      {icon &&
        cloneElement(icon, {
          className: StyleHelper.mergeStyles('w-6 h-6 min-w-6 min-h-6', icon.props.className),
        })}

      <div className="grow">{message}</div>

      {closeable && (
        <MdClose
          aria-hidden
          className="h-6 min-h-6 w-6 min-w-6 cursor-pointer opacity-50"
          onClick={() => toast.dismiss(sonnerId)}
        />
      )}
    </div>
  )
}

export const SuccessToast = ({ message, sonnerId }: Pick<TBaseToastProps, 'message' | 'sonnerId'>) => {
  return (
    <BaseToast
      className="text-neon bg-green-700"
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
export default ToastProvider
