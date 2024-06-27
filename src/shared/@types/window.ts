import { ElectronAPI } from '@electron-toolkit/preload'
import { rendererApi } from '@shared/api/renderer'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof rendererApi
  }
}
