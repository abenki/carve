import React, { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import ThumbnailStrip from './components/Thumbnails/ThumbnailStrip'
import SlideViewport from './components/SlideViewer/SlideViewport'
import ChatPanel from './components/Chat/ChatPanel'
import Settings from './components/Settings'
import Toast from './components/Toast'
import { useSlidesStore } from './store/slides'
import { useUIStore } from './store/ui'
import { useSettingsStore } from './store/settings'
import { useFileActions } from './hooks/useFileActions'
import { useAutosave } from './hooks/useAutosave'

export default function App(): React.ReactElement {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { undo, redo } = useSlidesStore()
  const project = useSlidesStore((s) => s.project)
  const { toastMessage, showToast, dismissToast, currentFilePath, isDirty } = useUIStore()
  const { loadFromElectron } = useSettingsStore()
  const { newProject, save, saveAs, open } = useFileActions()

  useAutosave()

  useEffect(() => {
    loadFromElectron()
  }, [])

  // Window title: "Project name [•] — Carve"
  useEffect(() => {
    const name = currentFilePath
      ? currentFilePath.split(/[\\/]/).pop()?.replace(/\.carve$/, '') ?? project.name
      : project.name
    document.title = `${name}${isDirty && currentFilePath ? ' •' : ''} — Carve`
  }, [project.name, currentFilePath, isDirty])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (meta && e.key === 'z' && e.shiftKey)  { e.preventDefault(); redo() }
      if (meta && e.key === ',')                 { e.preventDefault(); setSettingsOpen(true) }
      if (meta && e.key === 'n')                 { e.preventDefault(); newProject() }
      if (meta && e.key === 's' && !e.shiftKey) { e.preventDefault(); save() }
      if (meta && e.key === 's' && e.shiftKey)  { e.preventDefault(); saveAs() }
      if (meta && e.key === 'o')                 { e.preventDefault(); open() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, newProject, save, saveAs, open])

  return (
    <div className="flex flex-col h-full bg-app-bg text-txt-primary">
      <Toolbar onSettingsOpen={() => setSettingsOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <ThumbnailStrip />
        <SlideViewport />
        <ChatPanel />
      </div>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => showToast('Settings saved')}
      />
      <Toast message={toastMessage} onDismiss={dismissToast} />
    </div>
  )
}
