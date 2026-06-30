import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/cn'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemma-4-31b-it',
]

export default function Settings({ open, onClose, onSaved }: Props): React.ReactElement | null {
  const { settings, updateSettings } = useSettingsStore()
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [slideSize, setSlideSize] = useState<'16:9' | '4:3'>('16:9')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setApiKey(settings.apiKey)
      setModel(settings.model)
      setSlideSize(settings.slideSize)
    }
  }, [open, settings])

  async function handleSave(): Promise<void> {
    setSaving(true)
    const next = { apiKey, model: model || 'gemini-2.5-pro', slideSize }
    try {
      await window.api.saveSettings(next)
      updateSettings(next)
      onSaved()
      onClose()
    } catch (err) {
      console.error('Settings save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative w-[440px] bg-app-surface border border-app-border2 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <h2 className="text-md font-medium text-txt-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-txt-muted hover:text-txt-primary hover:bg-app-overlay transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">

          {/* API Key */}
          <Field label="Google AI Studio API Key">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza…"
                className="w-full bg-app-bg border border-app-border2 rounded px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted pr-9 focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary transition-colors"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <p className="text-2xs text-txt-muted mt-1.5">
              Stored encrypted on your device via OS keychain.
            </p>
          </Field>

          {/* Model */}
          <Field label="Model">
            <div className="flex gap-2">
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemini-2.5-pro"
                className="flex-1 bg-app-bg border border-app-border2 rounded px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent transition-colors"
              />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={cn(
                    'px-2 py-0.5 rounded text-2xs border transition-colors',
                    model === m
                      ? 'bg-accent text-white border-accent'
                      : 'border-app-border2 text-txt-secondary hover:border-accent hover:text-txt-primary'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          {/* Slide size */}
          <Field label="Default slide size">
            <div className="flex gap-2">
              {(['16:9', '4:3'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSlideSize(size)}
                  className={cn(
                    'flex-1 py-2 rounded border text-sm transition-colors',
                    slideSize === size
                      ? 'bg-accent text-white border-accent'
                      : 'border-app-border2 text-txt-secondary hover:border-accent hover:text-txt-primary'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-app-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-txt-secondary">{label}</label>
      {children}
    </div>
  )
}
