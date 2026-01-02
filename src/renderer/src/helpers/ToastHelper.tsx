import { cloneElement } from 'react'

import { getI18n } from 'react-i18next'
import { toast as sonner, Toaster as SonnerToaster } from 'sonner'

import { Loader } from '@renderer/components/Loader'

import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

import MdCheckCircleOutline from '@renderer/assets/images/md-check-circle-outline.svg?react'
import MdClose from '@renderer/assets/images/md-close.svg?react'
import MdErrorOutline from '@renderer/assets/images/md-error-outline.svg?react'

import type { TToastHelperToastOptions, TToastHelperToastProps } from '@shared/types/helpers'

import { StyleHelper } from './StyleHelper'
import { TestHelper } from './TestHelper'

const { t } = getI18n()

export class ToastHelper {
  private static Toast({ message, className, sonnerId, icon, closeable = true }: TToastHelperToastProps) {
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
          <button
            aria-label={t('common:general.close')}
            className="cursor-pointer opacity-50"
            onClick={() => sonner.dismiss(sonnerId)}
          >
            <MdClose aria-hidden className="h-6 min-h-6 w-6 min-w-6" />
          </button>
        )}
      </div>
    )
  }

  static Provider() {
    return <SonnerToaster position="bottom-center" expand gap={10} />
  }

  static dismiss(id: string | number) {
    sonner.dismiss(id)
  }

  static success({ id, message, ...props }: TToastHelperToastOptions) {
    const customId = id ?? UtilsHelper.uuid()

    sonner.custom(
      sonnerId => (
        <this.Toast
          className="text-neon bg-green-700"
          sonnerId={sonnerId}
          icon={<MdCheckCircleOutline aria-hidden />}
          message={message}
        />
      ),
      {
        ...props,
        id: customId,
        unstyled: true,
      }
    )
  }

  static error({ id, message, ...props }: TToastHelperToastOptions) {
    const customId = id ?? UtilsHelper.uuid()

    sonner.custom(
      sonnerId => (
        <this.Toast
          className="bg-pink-700 text-white"
          message={message}
          sonnerId={sonnerId}
          icon={<MdErrorOutline aria-hidden className="text-magenta" />}
        />
      ),
      {
        ...props,
        id: customId,
        unstyled: true,
      }
    )
  }

  static info({ id, message, ...props }: TToastHelperToastOptions) {
    const customId = id ?? UtilsHelper.uuid()

    sonner.custom(
      sonnerId => (
        <this.Toast
          className="bg-orange text-white"
          message={message}
          sonnerId={sonnerId}
          icon={<MdErrorOutline aria-hidden className="text-white" />}
        />
      ),
      {
        ...props,
        id: customId,
        unstyled: true,
      }
    )
  }

  static async loading({ id, message, ...props }: TToastHelperToastOptions) {
    const customId = id ?? UtilsHelper.uuid()

    sonner.custom(
      sonnerId => (
        <this.Toast
          className="bg-orange text-white"
          message={message}
          sonnerId={sonnerId}
          icon={<Loader containerClassName="w-min" />}
          closeable={false}
        />
      ),
      {
        ...props,
        id: customId,
        unstyled: true,
        duration: Infinity,
      }
    )
  }
}
