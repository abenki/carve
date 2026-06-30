import { IpcMain, BrowserWindow, dialog, app } from 'electron'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

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

  ipcMain.handle('export:pdf', async (_event, printHtml: string, name: string, slideSize: '16:9' | '4:3') => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export as PDF',
      defaultPath: `${name}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })
    if (canceled || !filePath) return { canceled: true }

    // Write to a temp file — data: URIs can be unreliable for large HTML payloads
    const tmpPath = join(app.getPath('temp'), `carve-print-${Date.now()}.html`)
    await writeFile(tmpPath, printHtml, 'utf-8')

    const [pw, ph] = slideSize === '4:3' ? [1280, 960] : [1280, 720]

    const win = new BrowserWindow({
      show: false,
      width: pw,
      height: ph,
      webPreferences: { contextIsolation: true, javascript: false },
    })

    await win.loadFile(tmpPath)

    // microns: 1 px ≈ 264.583 µm at 96 dpi
    const µm = (px: number) => Math.round(px * 264.583)

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: { width: µm(pw), height: µm(ph) },
      margins: { marginType: 'none' },
    })

    win.destroy()
    await unlink(tmpPath).catch(() => {})
    await writeFile(filePath, pdfBuffer)

    return { canceled: false, filePath }
  })
}
