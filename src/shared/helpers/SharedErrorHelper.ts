import { BSError } from '@cityofzion/blockchain-service'

import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

const { t, ...i18next } = SharedI18nextHelper.get()

export class AppError extends Error {
  readonly displayMessage: string
  readonly fromAppError: boolean = false

  constructor(message: string, rootError?: unknown, fromAppError?: boolean) {
    super('')
    this.name = 'AppError'
    this.displayMessage = message
    this.fromAppError = fromAppError ?? false

    if (rootError && rootError instanceof Error && rootError.stack && !(rootError instanceof AppError)) {
      this.stack += `\nCaused by: ${rootError.stack}`
    }

    this.message = JSON.stringify({ name: this.name, displayMessage: this.displayMessage, stack: this.stack })
  }

  static wrap(error: unknown, defaultMessage?: string | undefined | null) {
    if (error instanceof AppError) {
      const appError = new AppError(error.displayMessage, undefined, true)
      return appError
    }

    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message)
        if (parsed && parsed.name === 'AppError') {
          const appError = new AppError(parsed.displayMessage, undefined, true)
          appError.stack = parsed.stack
          return appError
        }
      } catch {
        // Empty
      }

      if (defaultMessage === null) {
        return new AppError(error.message, error, false)
      }
    }
    const message = defaultMessage ?? t('errors.unexpectedError')
    return new AppError(message, error, false)
  }
}

export class WalletConnectError extends AppError {
  code: string

  constructor(message: string, code: string, rootError?: unknown, fromAppError?: boolean) {
    super(message, rootError, fromAppError)
    this.name = 'WalletConnectError'
    this.code = code
  }

  static wrap(error: unknown, defaultMessage?: string | undefined | null) {
    if (error instanceof WalletConnectError) {
      const walletConnectError = new WalletConnectError(error.displayMessage, error.code, undefined, true)
      return walletConnectError
    }

    if (error instanceof AppError) {
      return new WalletConnectError(error.displayMessage, 'UNEXPECTED_ERROR', undefined, true)
    }

    if (error instanceof BSError) {
      const hasTranslation = i18next.exists(`common:walletConnect.errorsByCode.${error.code}`)
      const message = hasTranslation
        ? t(`common:walletConnect.errorsByCode.${error.code}`, '')
        : (defaultMessage ?? t('walletConnect.errorsByCode.UNEXPECTED_ERROR'))
      const code = hasTranslation ? error.code : 'UNEXPECTED_ERROR'

      return new WalletConnectError(message, code, undefined, false)
    }

    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message)
        if (parsed?.name === 'WalletConnectError') {
          const wcError = new WalletConnectError(parsed.message, parsed.code, undefined, true)
          wcError.stack = parsed.stack
          return wcError
        }

        if (parsed?.name === 'AppError') {
          const wcError = new WalletConnectError(parsed.displayMessage, 'UNEXPECTED_ERROR', undefined, true)
          wcError.stack = parsed.stack
          return wcError
        }
      } catch {
        // Empty
      }

      if (defaultMessage === null) {
        return new WalletConnectError(error.message, 'UNEXPECTED_ERROR', error, false)
      }
    }

    const message = defaultMessage ?? t('walletConnect.errorsByCode.UNEXPECTED_ERROR')
    return new WalletConnectError(message, 'UNEXPECTED_ERROR', error, false)
  }
}
