import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // File operations
  openProject: () => ipcRenderer.invoke('file:open'),
  saveProject: (data: unknown, filePath: string) => ipcRenderer.invoke('file:save', data, filePath),
  saveProjectAs: (data: unknown) => ipcRenderer.invoke('file:saveAs', data),
  getRecentProjects: () => ipcRenderer.invoke('file:recent'),
  newProject: () => ipcRenderer.invoke('file:new'),

  // Export
  exportHtml: (html: string, name: string) => ipcRenderer.invoke('export:html', html, name),
  exportPdf: (html: string, name: string, slideSize: string) => ipcRenderer.invoke('export:pdf', html, name, slideSize),

  // Screenshot (for annotation → AI flow)
  captureSlide: (rect: { x: number; y: number; width: number; height: number }) =>
    ipcRenderer.invoke('screenshot:capture', rect),

  // Settings (API key stored encrypted)
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('settings:save', settings)
})
