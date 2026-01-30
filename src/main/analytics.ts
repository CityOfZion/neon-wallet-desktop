import axios from 'axios'

import { mainApi } from '@shared/api/main'
import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { AppError } from '@shared/helpers/SharedErrorHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'
import type { TAnalyticsLogEventParams, TIpcMainBaseOptions } from '@shared/types/api'

const { t } = SharedI18nextHelper.get()

let sessionId: string | null = null

export class MainAnalyticsHelper {
  static async #onLogAnalyticsEvent({ args }: TIpcMainBaseOptions<TAnalyticsLogEventParams>) {
    if (!SharedEnvHelper.VITE_GA_MEASUREMENT_ID || !SharedEnvHelper.VITE_GA_API_SECRET) {
      throw new AppError(t('errors.analyticsAreNotConfigured'))
    }

    if (!sessionId) {
      sessionId = Date.now().toString()
    }

    const response = await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${SharedEnvHelper.VITE_GA_MEASUREMENT_ID}&api_secret=${SharedEnvHelper.VITE_GA_API_SECRET}`,
      {
        client_id: args.clientId,
        consent: { ad_personalization: 'DENIED' },
        events: [
          {
            name: args.eventName,
            // If you want to test, you should also send debug_mode: 1 in the params object
            params: { ...args.params, session_id: sessionId, engagement_time_msec: 100 },
          },
        ],
      }
    )

    if (response.status !== 204) {
      throw new AppError(t('errors.analyticsEventLoggingFailed'))
    }
  }

  static setupHandlers() {
    mainApi.listenAsync('analytics:logEvent', this.#onLogAnalyticsEvent.bind(this))
  }
}
