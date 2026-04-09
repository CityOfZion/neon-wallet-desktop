import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'

import { name, version } from '../../../../package.json'
import { LoggerHelper } from './LoggerHelper'
import { UtilsHelper } from './UtilsHelper'

export class AnalyticsHelper {
  static #getClientId() {
    let clientId = localStorage.getItem('ga_client_id')

    if (!clientId) {
      clientId = UtilsHelper.uuid()
      localStorage.setItem('ga_client_id', clientId)
    }

    return clientId
  }

  static async logEvent(eventName: string, params: Record<string, any> = {}) {
    if (!SharedEnvHelper.PROD) {
      LoggerHelper.warn(`Analytics event skipped in non-production environment: ${eventName}`, {
        where: 'AnalyticsHelper',
        operation: 'logEvent',
      })
      return
    }

    try {
      await window.api.sendAsync('analytics:logEvent', {
        eventName,
        clientId: AnalyticsHelper.#getClientId(),
        params: { ...params, project: name, version },
      })
    } catch (error) {
      LoggerHelper.sentry(error, { where: 'AnalyticsHelper', operation: 'logEvent' })
    }
  }
}
