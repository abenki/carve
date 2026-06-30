import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { registerFileHandlers } from './handlers/file'
import { registerExportHandlers } from './handlers/export'
import { registerScreenshotHandlers } from './handlers/screenshot'
import { registerSettingsHandlers } from './handlers/settings'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerFileHandlers(ipcMain)
  registerExportHandlers(ipcMain)
  registerScreenshotHandlers(ipcMain)
  registerSettingsHandlers(ipcMain)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
