import { IpcMain, app, safeStorage } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

interface StoredSettings {
  encryptedApiKey?: string
  model: string
  slideSize: '16:9' | '4:3'
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'carve-settings.json')
}

async function readStored(): Promise<StoredSettings> {
  try {
    const raw = await readFile(settingsPath(), 'utf-8')
    return JSON.parse(raw) as StoredSettings
  } catch {
    return { model: 'gemini-2.5-pro', slideSize: '16:9' }
  }
}

export function registerSettingsHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('settings:get', async () => {
    const stored = await readStored()
    let apiKey = ''
    if (stored.encryptedApiKey && safeStorage.isEncryptionAvailable()) {
      try {
        const buf = Buffer.from(stored.encryptedApiKey, 'base64')
        apiKey = safeStorage.decryptString(buf)
      } catch {
        apiKey = ''
      }
    }
    return { apiKey, model: stored.model ?? 'gemini-2.5-pro', slideSize: stored.slideSize ?? '16:9' }
  })

  ipcMain.handle('settings:save', async (_event, settings: { apiKey: string; model: string; slideSize: string }) => {
    const stored: StoredSettings = {
      model: settings.model || 'gemini-2.5-pro',
      slideSize: (settings.slideSize as '16:9' | '4:3') || '16:9',
    }
    if (settings.apiKey && safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(settings.apiKey)
      stored.encryptedApiKey = Buffer.from(encrypted).toString('base64')
    }
    const path = settingsPath()
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify(stored, null, 2), 'utf-8')
  })
}
