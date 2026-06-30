import { IpcMain, dialog } from 'electron'
import { writeFile } from 'fs/promises'

export function registerExportHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('export:html', async (_event, html: string, name: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export as HTML',
      defaultPath: `${name}.html`,
      filters: [{ name: 'HTML File', extensions: ['html'] }],
    })
    if (canceled || !filePath) return { canceled: true }
    await writeFile(filePath, html, 'utf-8')
    return { canceled: false, filePath }
  })

  ipcMain.handle('export:pdf', async () => {
    // Phase 5: Playwright PDF export
  })
}
