import React, { useRef } from 'react'
import type { Slide, Theme } from '@/types'
import { renderSlideToHtml } from '@/lib/slideRenderer'
import { cn } from '@/lib/cn'

interface Props {
  slide: Slide
  theme: Theme
  index: number
  active: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent, index: number) => void
}

export default function Thumbnail({ slide, theme, index, active, onClick, onContextMenu }: Props): React.ReactElement {
  const html = renderSlideToHtml(slide, theme)

  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => onContextMenu(e, index)}
      className={cn(
        'group w-full px-2 py-1.5 flex flex-col gap-1.5 text-left transition-colors',
        active ? 'bg-accent-muted' : 'hover:bg-app-overlay'
      )}
    >
      {/* Slide preview */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded border transition-colors',
          active ? 'border-accent' : 'border-app-border2 group-hover:border-app-border2'
        )}
        style={{ aspectRatio: '16/9' }}
      >
        {/* Scale down the 900px slide to fit the thumbnail */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{ width: '900px', height: '506.25px', transform: `scale(${152 / 900})`, transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Slide number */}
      <span className={cn('text-2xs', active ? 'text-accent' : 'text-txt-muted')}>
        {index + 1}
      </span>
    </button>
  )
}
