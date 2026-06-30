import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatPanel(): React.ReactElement {
  return (
    <div className="w-80 flex flex-col border-l border-neutral-800 bg-neutral-950 shrink-0">
      <MessageList />
      <MessageInput />
    </div>
  )
}
