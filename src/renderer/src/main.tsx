import React from 'react'

import * as ReactSentry from '@sentry/react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'

import * as Sentry from '@sentry/electron/renderer'

import { sentryConfig } from '../../../sentry.config'
import { DragRegion } from './components/DragRegion'
import { pagesRouter } from './routes/pagesRouter'

import './assets/css/index.css'

const isProductionMode = !!import.meta.env?.VITE_SENTRY_DSN && !!import.meta.env.PROD
if (isProductionMode) {
  Sentry.init(
    {
      dsn: import.meta.env.VITE_SENTRY_DSN,
      ...sentryConfig,
    },
    ReactSentry.init
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DragRegion />

    <div className="h-[var(--height-screen-minus-drag-region)] w-screen">
      <RouterProvider router={pagesRouter} />
    </div>
  </React.StrictMode>
)
