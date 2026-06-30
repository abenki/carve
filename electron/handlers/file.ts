import { IpcMain, dialog, app } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export function registerFileHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('file:open', async () => {
    // TODO: open project.json via dialog
  })

  ipcMain.handle('file:save', async (_event, data: unknown) => {
    // TODO: save project.json to current project path
  })

  ipcMain.handle('file:saveAs', async (_event, data: unknown) => {
    // TODO: save project.json via save dialog
  })

  ipcMain.handle('file:recent', async () => {
    // TODO: return list of recent project paths from electron-store
    return []
  })

  ipcMain.handle('file:new', async () => {
    // TODO: return default blank project data
  })
}
