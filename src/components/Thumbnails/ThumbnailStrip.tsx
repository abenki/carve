import React, { useState } from 'react'
import { Plus, Copy, Trash2 } from 'lucide-react'
import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import Thumbnail from './Thumbnail'

interface ContextMenu {
  x: number
  y: number
  index: number
}

export default function ThumbnailStrip(): React.ReactElement {
  const { project, addSlide, deleteSlide, duplicateSlide } = useSlidesStore()
  const { activeSlideIndex, setActiveSlideIndex } = useUIStore()
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)

  function handleContextMenu(e: React.MouseEvent, index: number): void {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, index })
  }

  function closeMenu(): void {
    setContextMenu(null)
  }

  return (
    <div
      className="w-44 flex flex-col border-r border-app-border bg-app-surface shrink-0 select-none"
      onClick={closeMenu}
    >
      {/* Slides list */}
      <div className="flex-1 overflow-y-auto py-2">
        {project.slides.map((slide, i) => (
          <Thumbnail
            key={slide.id}
            slide={slide}
            theme={project.theme}
            index={i}
            active={i === activeSlideIndex}
            onClick={() => setActiveSlideIndex(i)}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* Add slide button */}
      <div className="border-t border-app-border p-2">
        <button
          onClick={() => {
            addSlide(activeSlideIndex)
            setActiveSlideIndex(activeSlideIndex + 1)
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-app-overlay transition-colors text-sm"
        >
          <Plus size={13} />
          <span>Add slide</span>
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-app-surface border border-app-border2 rounded shadow-lg py-1 min-w-36"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-txt-secondary hover:text-txt-primary hover:bg-app-overlay transition-colors"
            onClick={() => {
              duplicateSlide(contextMenu.index)
              setActiveSlideIndex(contextMenu.index + 1)
              closeMenu()
            }}
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-txt-secondary hover:text-red-400 hover:bg-app-overlay transition-colors"
            onClick={() => {
              deleteSlide(contextMenu.index)
              if (activeSlideIndex >= project.slides.length - 1) {
                setActiveSlideIndex(Math.max(0, project.slides.length - 2))
              }
              closeMenu()
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
