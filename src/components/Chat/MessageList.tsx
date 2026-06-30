import React, { useEffect, useRef } from 'react'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/cn'

export default function MessageList(): React.ReactElement {
  const { messages } = useUIStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-txt-muted text-sm text-center leading-relaxed">
          Describe a change or annotate the slide and ask the AI to edit it.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn('flex flex-col gap-1', msg.role === 'user' ? 'items-end' : 'items-start')}
        >
          {msg.imageBase64 && (
            <img
              src={msg.imageBase64}
              alt="Annotation"
              className="rounded border border-app-border2 max-w-full"
              style={{ maxHeight: 120 }}
            />
          )}
          <div
            className={cn(
              'px-3 py-2 rounded-lg text-sm max-w-[90%] leading-relaxed',
              msg.role === 'user'
                ? 'bg-accent text-white rounded-br-sm'
                : 'bg-app-overlay text-txt-primary rounded-bl-sm'
            )}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
