import type { TLoggerHelperOptions } from '@shared/types/helpers'

import { SentryHelper } from './SentryHelper'

export class LoggerHelper {
  static #formatLocator(options: TLoggerHelperOptions) {
    return `[${options.where}${options.operation ? ' - ' + options.operation : ''}]`
  }

  static debug(log: unknown, options: TLoggerHelperOptions) {
    console.debug(`%c${this.#formatLocator(options)}`, 'color: #888', log)
  }

  static info(log: unknown, options: TLoggerHelperOptions) {
    console.info(`%c${this.#formatLocator(options)}`, 'color: #1976d2', log)
  }

  static warn(log: unknown, options: TLoggerHelperOptions) {
    console.warn(`%c${this.#formatLocator(options)}`, 'color: #ffa000', log)
  }

  static error(log: unknown, options: TLoggerHelperOptions) {
    console.error(`%c${this.#formatLocator(options)}`, 'color: #d32f2f', log)
  }

  static sentry(log: unknown, options: TLoggerHelperOptions) {
    this.error(log, options)
    SentryHelper.capture(log, { where: options.where, operation: options.operation, level: 'error' })
  }
}
