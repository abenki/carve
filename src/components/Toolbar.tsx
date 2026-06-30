import React, { useState, useEffect, useRef } from 'react'
import { Undo2, Redo2, FileDown, FolderOpen, Save, Settings } from 'lucide-react'
import { useSlidesStore } from '@/store/slides'
import { useUIStore } from '@/store/ui'
import { useFileActions } from '@/hooks/useFileActions'

interface Props {
  onSettingsOpen: () => void
}

export default function Toolbar({ onSettingsOpen }: Props): React.ReactElement {
  const { project, updateProjectName, undo, redo, undoStack, redoStack } = useSlidesStore()
  const { isDirty, currentFilePath } = useUIStore()
  const { save, open, exportHtml } = useFileActions()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(project.name)
  }, [project.name])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commitName(): void {
    const trimmed = name.trim() || 'Untitled'
    updateProjectName(trimmed)
    setName(trimmed)
    setEditing(false)
  }

  return (
    <div
      className="h-10 flex items-center px-3 border-b border-app-border bg-app-surface shrink-0 gap-2"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS traffic-light spacer */}
      <div className="w-16 shrink-0" />

      {/* Project name */}
      <div className="flex-1 flex justify-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setName(project.name); setEditing(false) } }}
            className="bg-app-overlay border border-accent rounded px-2 py-0.5 text-sm text-txt-primary text-center w-48"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-txt-secondary hover:text-txt-primary transition-colors px-2 py-0.5 rounded hover:bg-app-overlay flex items-center gap-1.5"
          >
            {project.name}
            {isDirty && currentFilePath && (
              <span className="w-1.5 h-1.5 rounded-full bg-txt-muted shrink-0" title="Unsaved changes" />
            )}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <ToolbarButton onClick={undo} disabled={undoStack.length === 0} title="Undo (⌘Z)">
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={redo} disabled={redoStack.length === 0} title="Redo (⌘⇧Z)">
          <Redo2 size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-app-border2 mx-1" />

        <ToolbarButton onClick={open} title="Open project (⌘O)">
          <FolderOpen size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={save} title="Save project (⌘S)">
          <Save size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={exportHtml} title="Export as HTML">
          <FileDown size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-app-border2 mx-1" />

        <ToolbarButton onClick={onSettingsOpen} title="Settings (⌘,)">
          <Settings size={14} />
        </ToolbarButton>
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded text-txt-secondary hover:text-txt-primary hover:bg-app-overlay transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
