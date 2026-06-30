import React, { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import ThumbnailStrip from './components/Thumbnails/ThumbnailStrip'
import SlideViewport from './components/SlideViewer/SlideViewport'
import ChatPanel from './components/Chat/ChatPanel'
import Settings from './components/Settings'
import Toast from './components/Toast'
import { useSlidesStore } from './store/slides'
import { useSettingsStore } from './store/settings'
import { useToast } from './hooks/useToast'

export default function App(): React.ReactElement {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { undo, redo } = useSlidesStore()
  const { loadFromElectron } = useSettingsStore()
  const { message: toastMessage, show: showToast, dismiss: dismissToast } = useToast()

  // Load settings from Electron on mount
  useEffect(() => {
    loadFromElectron()
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (meta && e.key === 'z' && e.shiftKey)  { e.preventDefault(); redo() }
      if (meta && e.key === ',')                 { e.preventDefault(); setSettingsOpen(true) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo])

  return (
    <div className="flex flex-col h-full bg-app-bg text-txt-primary">
      <Toolbar onSettingsOpen={() => setSettingsOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <ThumbnailStrip />
        <SlideViewport />
        <ChatPanel />
      </div>

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={() => showToast('Settings saved')} />
      <Toast message={toastMessage} onDismiss={dismissToast} />
    </div>
  )
}
