import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { ErrorToast, InfoToast, PromiseToast, SuccessToast } from '@renderer/libs/sonner'
import { toast, ToastT } from 'sonner'

type TToastProp = Omit<ToastT, 'id'> & {
  message: string
  id?: string | number
}

export class ToastHelper {
  static dismiss(id: string | number) {
    toast.dismiss(id)
  }

  static success({ id, message, ...props }: TToastProp) {
    const customId = id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <SuccessToast sonnerId={sonnerId} message={message} />, {
      ...props,
      id: customId,
      unstyled: true,
    })
  }

  static error({ id, message, ...props }: TToastProp) {
    const customId = id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <ErrorToast sonnerId={sonnerId} message={message} />, {
      ...props,
      id: customId,
      unstyled: true,
    })
  }

  static info({ id, message, ...props }: TToastProp) {
    const customId = id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <InfoToast sonnerId={sonnerId} message={message} />, {
      ...props,
      id: customId,
      unstyled: true,
    })
  }

  static async loading({ id, message, ...props }: TToastProp) {
    const customId = id ?? UtilsHelper.uuid()

    toast.custom(sonnerId => <PromiseToast sonnerId={sonnerId} message={message} />, {
      ...props,
      id: customId,
      unstyled: true,
      duration: Infinity,
    })
  }
}
