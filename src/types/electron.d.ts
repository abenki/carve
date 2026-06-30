import type { AppSettings } from './index'

export interface ElectronAPI {
  openProject: () => Promise<unknown>
  saveProject: (data: unknown) => Promise<void>
  saveProjectAs: (data: unknown) => Promise<void>
  getRecentProjects: () => Promise<{ name: string; path: string; updatedAt: string }[]>
  newProject: () => Promise<unknown>
  exportHtml: (html: string, name: string) => Promise<void>
  exportPdf: (html: string, name: string) => Promise<void>
  captureSlide: (rect: { x: number; y: number; width: number; height: number }) => Promise<string>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
