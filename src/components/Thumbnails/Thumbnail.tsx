import React from 'react'
import type { Slide, Theme } from '@/types'
import { renderSlideToHtml } from '@/lib/slideRenderer'
import { useSettingsStore } from '@/store/settings'
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
  const { settings } = useSettingsStore()
  const html = renderSlideToHtml(slide, theme)
  const aspectRatio = settings.slideSize === '4:3' ? '4/3' : '16/9'
  // content canvas is always 900px wide; height depends on ratio
  const contentH = settings.slideSize === '4:3' ? 675 : 506.25

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
        style={{ aspectRatio }}
      >
        {/* Scale down the 900px slide to fit the thumbnail */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{ width: '900px', height: `${contentH}px`, transform: `scale(${152 / 900})`, transformOrigin: 'top left' }}
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
