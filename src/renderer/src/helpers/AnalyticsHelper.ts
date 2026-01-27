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
    if (!import.meta.env.PROD) {
      console.warn('Analytics event skipped in non-production environment:', eventName, params)
      return
    }

    try {
      await window.api.sendAsync('analytics:logEvent', {
        eventName,
        clientId: AnalyticsHelper.#getClientId(),
        params,
      })
    } catch (error) {
      console.error(error)
    }
  }
}
