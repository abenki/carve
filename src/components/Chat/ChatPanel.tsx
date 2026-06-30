import React from 'react'
import { Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatPanel(): React.ReactElement {
  const { isAiThinking } = useUIStore()

  return (
    <div className="w-72 flex flex-col border-l border-app-border bg-app-surface shrink-0">
      {/* Header */}
      <div className="h-10 flex items-center gap-2 px-3 border-b border-app-border shrink-0">
        <Sparkles size={13} className="text-accent" />
        <span className="text-sm font-medium text-txt-primary">AI Assistant</span>
        {isAiThinking && (
          <span className="ml-auto text-2xs text-txt-muted animate-pulse">Thinking…</span>
        )}
      </div>

      <MessageList />
      <MessageInput />
    </div>
  )
}
