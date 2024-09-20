import { mainApi } from '@shared/api/main'
import { BrowserWindow, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'

export function registerWindowHandlers() {
  mainApi.listenSync('closeWindow', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) mainWindow.destroy()
  })

  mainApi.listenSync('restore', ({ window }) => {
    if (window.isMinimized()) {
      window.restore()
    } else {
      window.show()
    }
    window.focus()
  })

  mainApi.listenAsync('openDialog', async ({ args }) => {
    const result = await dialog.showOpenDialog(args)
    if (result.canceled) throw new Error('Dialog cancelled')
    return result.filePaths
  })

  mainApi.listenAsync('readFile', async ({ args }) => {
    const file = await readFile(args)
    return file.toString('utf-8')
  })

  mainApi.listenAsync('saveFile', async ({ args }) => {
    const buff = Buffer.from(args.content, 'utf-8')
    await writeFile(args.path, buff)
  })

  mainApi.listenAsync('setTitleBarOverlay', ({ args, window }) => {
    window.setTitleBarOverlay(args)
  })

  mainApi.listenAsync('setWindowButtonPosition', ({ args, window }) => {
    window.setWindowButtonPosition(args)
  })
}
