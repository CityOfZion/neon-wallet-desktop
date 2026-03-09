import React from 'react'

import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'

import { DragRegion } from './components/DragRegion'
import { SentryHelper } from './helpers/SentryHelper'
import { pagesRouter } from './routes/pages-router'

import './assets/css/index.css'

SharedEnvHelper.setup()
SentryHelper.setup()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DragRegion />

    <div className="h-[var(--height-screen-minus-drag-region)] w-screen">
      <RouterProvider router={pagesRouter} />
    </div>
  </React.StrictMode>
)
