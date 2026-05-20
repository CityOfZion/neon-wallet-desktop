import React from 'react'

import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'

import { AppBar } from './components/AppBar'
import { CrispHelper } from './helpers/CrispHelper'
import { SentryHelper } from './helpers/SentryHelper'
import { pagesRouter } from './routes/pages-router'

import './assets/css/index.css'

SharedEnvHelper.setup()
SentryHelper.setup()
CrispHelper.setup()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppBar />

    <div className="h-(--height-screen-minus-drag-region) w-screen">
      <RouterProvider router={pagesRouter} />
    </div>
  </React.StrictMode>
)
