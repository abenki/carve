import { IpcMain, safeStorage } from 'electron'

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('settings:get', async () => {
    // TODO: read encrypted API key + preferences from disk
    return { apiKey: '', model: 'gemini-2.5-pro', slideSize: '16:9' }
  })

  ipcMain.handle('settings:save', async (_event, settings: unknown) => {
    // TODO: encrypt API key via safeStorage, persist remaining prefs
  })
}
