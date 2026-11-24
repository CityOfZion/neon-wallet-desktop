import React from 'react'

import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { RouterProvider } from 'react-router'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { SharedI18nextHelper } from '@shared/helpers/SharedI18nextHelper'

import { AppBar } from './components/AppBar'
import { CrispHelper } from './helpers/CrispHelper'
import { SentryHelper } from './helpers/SentryHelper'
import { pagesRouter } from './routes/pages-router'

import './assets/css/styles.css'

SharedEnvHelper.setup()
SentryHelper.setup()
CrispHelper.setup()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={SharedI18nextHelper.get()}>
      <AppBar />

      <div className="h-(--height-screen-minus-drag-region) w-screen">
        <RouterProvider router={pagesRouter} />
      </div>
    </I18nextProvider>
  </React.StrictMode>
)
