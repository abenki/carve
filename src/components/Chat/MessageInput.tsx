import React, { useState, useRef } from 'react'
import { Send, X } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/cn'

export default function MessageInput(): React.ReactElement {
  const [value, setValue] = useState('')
  const { pendingAnnotation, setPendingAnnotation, isAiThinking } = useUIStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend(): void {
    const msg = value.trim()
    if (!msg || isAiThinking) return
    // Phase 2: wire to Gemini
    console.log('Send:', { msg, hasAnnotation: !!pendingAnnotation })
    setValue('')
    setPendingAnnotation(null)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-app-border p-3 flex flex-col gap-2">
      {/* Annotation preview */}
      {pendingAnnotation && (
        <div className="relative">
          <img
            src={pendingAnnotation}
            alt="Annotation preview"
            className="w-full rounded border border-app-border2"
            style={{ maxHeight: 80, objectFit: 'contain' }}
          />
          <button
            onClick={() => setPendingAnnotation(null)}
            className="absolute top-1 right-1 p-0.5 rounded bg-app-surface text-txt-secondary hover:text-txt-primary"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className={cn('flex items-end gap-2 rounded border bg-app-overlay transition-colors',
        'border-app-border2 focus-within:border-accent')}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a change…"
          rows={1}
          disabled={isAiThinking}
          className="flex-1 bg-transparent resize-none px-3 py-2 text-sm text-txt-primary placeholder:text-txt-muted disabled:opacity-50 max-h-32"
          style={{ lineHeight: '1.4', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isAiThinking}
          className="mb-2 mr-2 p-1.5 rounded bg-accent text-white disabled:opacity-30 hover:bg-accent-hover transition-colors shrink-0"
        >
          <Send size={12} />
        </button>
      </div>

      <p className="text-2xs text-txt-muted">⏎ send · ⇧⏎ newline</p>
    </div>
  )
}
