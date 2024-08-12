import { UtilsHelper } from '@renderer/helpers/UtilsHelper'
import { ErrorToast, InfoToast, PromiseToast, SuccessToast } from '@renderer/libs/sonner'
import { toast } from 'sonner'

type TToastProp = {
  message: string
  id?: string | number
  duration?: number
}

export class ToastHelper {
  static dismiss(id: string | number) {
    toast.dismiss(id)
  }

  static success(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <SuccessToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
      duration: props.duration,
    })
  }

  static error(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <ErrorToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
      duration: props.duration,
    })
  }

  static info(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()
    toast.custom(sonnerId => <InfoToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
      duration: props.duration,
    })
  }

  static async loading(props: TToastProp) {
    const customId = props.id ?? UtilsHelper.uuid()

    toast.custom(sonnerId => <PromiseToast sonnerId={sonnerId} message={props.message} />, {
      id: customId,
      unstyled: true,
      duration: Infinity,
    })
  }
}
