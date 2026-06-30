import { IpcMain, dialog } from 'electron'

export function registerExportHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('export:html', async (_event, html: string, name: string) => {
    // TODO: show save dialog, write self-contained HTML file
  })

  ipcMain.handle('export:pdf', async (_event, html: string, name: string) => {
    // TODO: launch Playwright, render HTML, export PDF
  })
}
