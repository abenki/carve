import { IpcMain, dialog } from 'electron'
import { readFile, writeFile } from 'fs/promises'

export function registerFileHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('file:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Project',
      filters: [{ name: 'Carve Project', extensions: ['carve'] }],
      properties: ['openFile'],
    })
    if (canceled || filePaths.length === 0) return { canceled: true }
    const raw = await readFile(filePaths[0], 'utf-8')
    return { canceled: false, filePath: filePaths[0], project: JSON.parse(raw) }
  })

  ipcMain.handle('file:save', async (_event, data: unknown, filePath: string) => {
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { canceled: false, filePath }
  })

  ipcMain.handle('file:saveAs', async (_event, data: unknown) => {
    const name = (data as { name?: string })?.name ?? 'Untitled'
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Project',
      defaultPath: `${name}.carve`,
      filters: [{ name: 'Carve Project', extensions: ['carve'] }],
    })
    if (canceled || !filePath) return { canceled: true }
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { canceled: false, filePath }
  })

  ipcMain.handle('file:recent', async () => [])
  ipcMain.handle('file:new', async () => null)
}
