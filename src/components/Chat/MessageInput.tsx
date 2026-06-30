import React, { useState, useRef } from 'react'
import { Send, X } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/cn'

export default function MessageInput(): React.ReactElement {
  const [value, setValue] = useState('')
  const { pendingAnnotation, setPendingAnnotation, isAiThinking, setDrawMode } = useUIStore()
  const { send } = useChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend(): Promise<void> {
    const msg = value.trim()
    if (!msg || isAiThinking) return

    let image: string | undefined

    // Capture the full slide + annotation overlay via Electron screenshot
    if (pendingAnnotation) {
      const container = document.querySelector('[data-slide-container]')
      if (container) {
        const rect = container.getBoundingClientRect()
        try {
          image = await window.api.captureSlide({
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          })
        } catch (err) {
          console.error('Screenshot capture failed:', err)
          // Fall back to canvas-only annotation
          image = pendingAnnotation
        }
      }
    }

    setValue('')
    setPendingAnnotation(null)
    setDrawMode(false)

    await send(msg, image)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`
    }
  }

  return (
    <div className="border-t border-app-border p-3 flex flex-col gap-2">
      {/* Annotation preview — canvas-only marks shown as context for the user */}
      {pendingAnnotation && (
        <div className="relative">
          <img
            src={pendingAnnotation}
            alt="Annotation"
            className="w-full rounded border border-app-border2"
            style={{ maxHeight: 80, objectFit: 'contain', background: '#1a1a1a' }}
          />
          <button
            onClick={() => setPendingAnnotation(null)}
            className="absolute top-1 right-1 p-0.5 rounded bg-app-surface border border-app-border2 text-txt-muted hover:text-txt-primary"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className={cn(
          'flex items-end gap-1.5 rounded border bg-app-bg transition-colors',
          'border-app-border2 focus-within:border-accent'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe a change…"
          rows={1}
          className="flex-1 bg-transparent resize-none px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted"
          style={{ lineHeight: '1.5', minHeight: '36px', maxHeight: '128px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isAiThinking}
          className="mb-1.5 mr-1.5 p-1.5 rounded bg-accent text-white disabled:opacity-30 hover:bg-accent-hover transition-colors shrink-0"
        >
          <Send size={11} />
        </button>
      </div>

      <p className="text-2xs text-txt-muted">⏎ send · ⇧⏎ newline</p>
    </div>
  )
}
