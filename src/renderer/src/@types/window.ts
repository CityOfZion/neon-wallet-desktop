import { ElectronAPI } from '@electron-toolkit/preload'

import { customAPI } from '../../../preload/customAPI'
import { customListeners } from '../../../preload/customListeners'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof customAPI
    listeners: typeof customListeners
  }
}
