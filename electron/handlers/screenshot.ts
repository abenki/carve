import { IpcMain, BrowserWindow } from 'electron'

export function registerScreenshotHandlers(ipcMain: IpcMain): void {
  ipcMain.handle(
    'screenshot:capture',
    async (event, rect: { x: number; y: number; width: number; height: number }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (!win) throw new Error('No window found')

      const image = await win.webContents.capturePage({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })

      return image.toDataURL()
    }
  )
}
