import { IpcMain, BrowserWindow } from 'electron'

export function registerScreenshotHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    'screenshot:capture',
    async (_event, rect: { x: number; y: number; width: number; height: number }) => {
      // TODO: use webContents.capturePage(rect) on the focused window
      // Returns base64 PNG string
    }
  )
}
