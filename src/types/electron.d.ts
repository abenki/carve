import type { AppSettings, Project } from './index'

interface FileResult {
  canceled: boolean
  filePath?: string
}

interface OpenResult extends FileResult {
  project?: Project
}

export interface ElectronAPI {
  openProject: () => Promise<OpenResult>
  saveProject: (data: unknown, filePath: string) => Promise<FileResult>
  saveProjectAs: (data: unknown) => Promise<FileResult>
  getRecentProjects: () => Promise<{ name: string; path: string; updatedAt: string }[]>

  exportHtml: (html: string, name: string) => Promise<FileResult>
  exportPdf: (html: string, name: string) => Promise<FileResult>

  captureSlide: (rect: { x: number; y: number; width: number; height: number }) => Promise<string>

  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
