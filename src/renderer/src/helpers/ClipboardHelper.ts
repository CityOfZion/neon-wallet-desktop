import { ToastHelper } from '@renderer/helpers/ToastHelper'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

const { t } = SharedI18nextHelper.get()

export class ClipboardHelper {
  static async write(text: string) {
    navigator.clipboard.writeText(text)
    ToastHelper.success({ message: t('common:general.successfullyCopied') })
  }

  static async read(): Promise<string> {
    return await navigator.clipboard.readText()
  }
}
