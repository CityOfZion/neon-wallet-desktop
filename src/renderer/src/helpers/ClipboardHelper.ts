import { getI18n } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

const { t } = getI18n()

export class ClipboardHelper {
  static async write(text: string) {
    navigator.clipboard.writeText(text)
    ToastHelper.success({ message: t('common:general.successfullyCopied') })
  }

  static async read(): Promise<string> {
    return await navigator.clipboard.readText()
  }
}
