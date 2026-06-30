import React from 'react'
import type { Slide, Theme } from '@/types'

interface Props {
  slide: Slide
  theme: Theme
  index: number
  active: boolean
  onClick: () => void
}

export default function Thumbnail({ index, active, onClick }: Props): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`w-full p-2 text-left border-b border-neutral-800 ${active ? 'bg-neutral-700' : 'hover:bg-neutral-800'}`}
    >
      {/* Miniature slide preview + slide number */}
      <div className="aspect-video bg-neutral-700 rounded text-xs flex items-center justify-center text-neutral-400">
        {index + 1}
      </div>
    </button>
  )
}
