import { getI18n } from 'react-i18next'

import { ToastHelper } from '@renderer/helpers/ToastHelper'

const { t } = getI18n()

export class ClipboardHelper {
  static async write(text: string) {
    ToastHelper.success({ message: t('common:general.successfullyCopied') })
    navigator.clipboard.writeText(text)
  }
}
